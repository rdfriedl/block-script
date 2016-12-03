import THREE from 'three';

/**
 * @class
 * @name CollisionEntity
 *
 * @param {CollisionShape} [shape] - the shape that this entity will use
 */
export default class CollisionEntity{
	constructor(){
		/**
		 * the position of this CollisionEntity
		 * @var {THREE.Vector3}
		 */
		this.position = new THREE.Vector3();

		/**
		 * the velocity of this CollisionEntity
		 * @var {THREE.Vector3}
		 */
		this.velocity = new THREE.Vector3();

		/**
		 * whether this entity is static
		 * @var {Boolean}
		 */
		this.isStatic = false;

		/**
		 * the {@link CollisionWorld} that this entity belongs to.
		 * this is used in the step method
		 * @var {CollisionWorld}
		 */
		this.world = undefined
	}

	/**
	 * updates this entity
	 * @param {Number} dtime - the delta time
	 * @return {this}
	 */
	step(dtime){
		let velocity = this.velocity.clone().multiplyScalar(dtime);

		// get movment boundingBox
		let movementBox = this.boundingBox;
		movementBox.union(this.boundingBox.translate(velocity));

		// get all entities that are in the way
		let entities = this.world.listEntities().filter(entity => {
			// make sure its not us, and also that its static (since we cant handle non-static collisions)
			return entity !== this && entity.isStatic && movementBox.intersectsBox(entity.boundingBox);
		});

		// loop until we stop moving
		let a = 0;
		while(!velocity.empty() && a++ < 12){
			let col, entity;

			// find the first collision
			for (var i = 0; i < entities.length; i++) {
				let data = entities[i].getCollisionData(this, velocity, movementBox);
				if(!col || data.entryTime <= col.entryTime){
					col = data;
					entity = entities[i];
				}
			}

			// if there was no collision
			if(!col || col.entryTime == Infinity || col.entryTime == 1){
				// move
				this.position.add(velocity);
				velocity.set(0,0,0);
			}
			else{
				// if col.entryTime is inifnity, set it to 1
				let entryTime = Number.isFinite(col.entryTime) ? col.entryTime : 1;

				// jump to time of collision
				this.position.add(velocity.clone().multiplyScalar(col.entryTime));

				// ajust velocity to slide
				velocity.projectOnPlane(col.normal).multiplyScalar(1 - entryTime);

				if(this.onCollision)
					this.onCollision(entity, col.normal)
			}
		}

		return this;
	}

	/**
	 * this is called when a collision happens
	 * @param {CollisionEntity} entity
	 * @param {THREE.Vector3} normal
	 */
	onCollision(entity, normal){}

	/**
	 * returns a bounding box for this entity
	 * @return {THREE.Box}
	 */
	getBoundingBox(){
		return new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	}

	/**
	 * returns the bounding box of this entity relivive to its position
	 * @return {THREE.Box3}
	 */
	get boundingBox(){
		return this.getBoundingBox().translate(this.position);
	}

	/**
	 * gets the time and normal of a collision
	 * @param {CollisionEntity} entity
	 * @param {THREE.Vector3} velocity
	 * @param {THREE.Box3} movementBox
	 * @returns {Object}
	 */
	getCollisionData(entity, velocity, movementBox){
		return {
			entryTime: Infinity, // it never collides with this entity
			exitTime: Infinity,
			normal: new THREE.Vector3()
		}
	}
}
