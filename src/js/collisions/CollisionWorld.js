import THREE from 'three';
import CollisionEntity from './CollisionEntity.js';

/**
 * @class
 * @name CollisionWorld
 */
export default class CollisionWorld{
	constructor(){
		/**
		 * a clock to keep track of time
		 * @var {THREE.Clock}
		 */
		this.clock = new THREE.Clock();

		/**
		 * a Set of CollisionEntity that are in this world
		 * @var {Set}
		 */
		this.entities = new Set();

		/**
		 * a THREE.Vector3 that is added to all non-static entities in this world every step
		 * @var {THREE.Vector3}
		 */
		this.gravity = new THREE.Vector3(0, -18, 0);
	}

	/**
	 * runs one step for the world
	 * @param {Number} [dtime] - the delta time to use, if none is provided it will get it from this worlds clock
	 * @return {this}
	 */
	step(dtime){
		if(dtime == undefined)
			dtime = this.clock.getDelta();
		else
			this.clock.getDelta();

		//update all entities
		let entities = this.listEntities().filter(e => !e.isStatic).forEach(entity => {
			// add gravity
			// NOTE: multiply gravity by dtime since its a type of acceleration and is effected by time
			entity.velocity.add(this.gravity.clone().multiplyScalar(dtime*60));

			// step
			entity.step(dtime);
		})

		return this;
	}

	/**
	 * call this when you start the world up again, it will reset the clock
	 * @return {this}
	 */
	unpause(){
		this.clock.getDelta();
		return this;
	}

	/**
	 * adds a {@link CollisionEntity} to this world
	 * @param {CollisionEntity} entity
	 * @returns {this}
	 */
	addEntity(entity){
		if(entity instanceof CollisionEntity){
			this.entities.add(entity);

			entity.world = this;
		}

		return this;
	}

	/**
	 * removes a {@link CollisionEntity} from this world
	 * @param  {CollisionEntity} entity
	 * @return {this}
	 */
	removeEntity(entity){
		if(this.entities.has(entity)){
			this.entities.delete(entity);

			entity.world = undefined;
		}

		return this;
	}

	/**
	 * returns an array of all {@link CollisionEntity}s in this world
	 * @return {CollisionEntity[]}
	 */
	listEntities(){
		return Array.from(this.entities);
	}
}
