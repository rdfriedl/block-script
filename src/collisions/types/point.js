import THREE from 'three';
import CollisionEntity from '../CollisionEntity.js';

/**
 * @class a point collition shape
 * @name CollisionEntityPoint
 * @extends {CollisionEntity}
 */
export default class CollisionEntityPoint extends CollisionEntity{
	getBoundingBox(){
		return new THREE.Box3(this.position, this.position);
	}

	getCollisionData(entity, velocity, movementBox){
		// TODO
		return super.getCollisionData(entity, velocity, movementBox);
	}

	get x(){
		return this.position.x;
	}
	get y(){
		return this.position.y;
	}
	get z(){
		return this.position.z;
	}

	/**
	 * @param {THREE.Vector3} a - the point thats moving
	 * @param {THREE.Box3} b - the static box
	 * @param {THREE.Vector3} velocity
	 * @returns {Object|Boolean} - returns object with info about collision, if there was no collision it will return false
	 */
	static SweptAABB(a, b, velocity){
		const axes = ['x','y','z'];
		var normal = new THREE.Vector3();
		var invEntry = new THREE.Vector3();
		var invExit = new THREE.Vector3();

		// find the distance between the objects on the near and far sides for all axes
		for (let i = 0; i < axes.length; i++) {
			let axis = axes[i];

			if(velocity[axis] > 0){
				invEntry[axis] = b.min[axis] - a[axis];
				invExit[axis] = b.max[axis] - a[axis];
			}
			else if(velocity[axis] < 0){
				invEntry[axis] = b.max[axis] - a[axis];
				invExit[axis] = b.min[axis] - a[axis];
			}
			// there is no movent on this axis, make sure the boxes over lap on this plane
			else if(a[axis] <= b.min[axis] || a[axis] >= b.max[axis]){
				// they are not overlaping on this axis, there is no way for them to collide
				return false;
			}
			// if they are overlapping then continue
		}

		// find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
		let entry = new THREE.Vector3();
		let exit = new THREE.Vector3();

		// calculate the entry and exit time
		for (let i = 0; i < axes.length; i++) {
			let axis = axes[i];

			if (velocity[axis] === 0){
				entry[axis] = -Infinity;
				exit[axis] = Infinity;
			}
			else{
				entry[axis] = invEntry[axis] / velocity[axis];
				exit[axis] = invExit[axis] / velocity[axis];
			}
		}

		// find the earliest/latest times of collision
		let entryTime = Math.max(entry.x, entry.y, entry.z);
		let exitTime = Math.min(exit.x, exit.y, exit.z);

		// if the entryTime is > 1 dont go any further then the velocity
		// if the entryTime is < 0 that means there was no collision
		// if the entryTime is greater then the exit time, something got messed up
		// there was no collision
		if(entryTime > exitTime || entryTime > 1 || entryTime < 0){
			return false;
		}
		else{ // there was a collision
			// calculate normal of collided surface
			if(entry.y > entry.x && entry.y > entry.z){
				normal.x = 0;
				normal.y = (velocity.y < 0) ? 1 : -1;
				normal.z = 0;
			}
			else if(entry.x > entry.y && entry.x > entry.z){
				normal.x = (velocity.x < 0) ? 1 : -1;
				normal.y = 0;
				normal.z = 0;
			}
			else if(entry.z > entry.x && entry.z > entry.y){
				normal.x = 0;
				normal.y = 0;
				normal.z = (velocity.z < 0) ? 1 : -1;
			}
			else{ // looks like two sides collided at the same time
				if(Math.abs(velocity.y) < Math.abs(velocity.x) && Math.abs(velocity.y) < Math.abs(velocity.z)){
					normal.x = 0;
					normal.y = (velocity.y < 0) ? 1 : -1;
					normal.z = 0;
				}
				else if(Math.abs(velocity.x) < Math.abs(velocity.y) && Math.abs(velocity.x) < Math.abs(velocity.z)){
					normal.x = (velocity.x < 0) ? 1 : -1;
					normal.y = 0;
					normal.z = 0;
				}
				else if(Math.abs(velocity.z) < Math.abs(velocity.x) && Math.abs(velocity.z) < Math.abs(velocity.y)){
					normal.x = 0;
					normal.y = 0;
					normal.z = (velocity.z < 0) ? 1 : -1;
				}
			}

			// return the entryTime of collision
			return {
				entryTime: entryTime,
				exitTime: exitTime,
				normal: normal
			};
		}
	}
}
