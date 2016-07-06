import THREE from 'three';
import CollisionEntity from '../CollisionEntity.js';

/**
 * @class
 * @name CollisionEntityBox
 * @extends {CollisionEntity}
 *
 * @param {THREE.Vector3} size - the size of the box
 * @param {THREE.Vector3} [offset] - the offset of the box from its center, if none is provided it will default to the center of the box
 */
export default class CollisionEntityBox extends CollisionEntity{
	constructor(size, offset){
        super();
		size = size || new THREE.Vector3();

		/**
		 * a Box3 that is used as the size of this CollisionEntityBox
		 * @var {THREE.Box3}
		 */
		this._box = new THREE.Box3(size.clone().divideScalar(2).negate(), size.clone().divideScalar(2));

		if(offset instanceof THREE.Vector3)
			this._box.translate(offset);
	}

	getBoundingBox(){
		return this._box.clone();
	}

	getCollisionData(entity, velocity, movementBox){
		if(entity instanceof CollisionEntityBox){
			let col = CollisionEntityBox.SweptAABB(entity.box, this.box, velocity);
			return {
				entryTime: col.entryTime == 1? Infinity : col.entryTime,
				exitTime: col.exitTime,
				normal: col.normal
			}
		}
		else if(entity instanceof CollisionEntityPoint){
			// TODO
		}

		return super.getCollisionData(entity, velocity, movementBox);
	}

	get box(){
		return this._box.clone().translate(this.position);
	}

	/**
	 * @param {THREE.Box3} a - the box thats moving
	 * @param {THREE.Box3} b - the static box
	 * @param {THREE.Vector3} velocity
	 * @returns {Object}
	 */
	static SweptAABB(a, b, velocity){
    	var normal = new THREE.Vector3();
        var invEntry = new THREE.Vector3();
        var invExit = new THREE.Vector3();

        // find the distance between the objects on the near and far sides for both x and y
        if(velocity.x > 0){
            invEntry.x = b.min.x - a.max.x;
            invExit.x = b.max.x - a.min.x;
        }
        else{
            invEntry.x = b.max.x - a.min.x;
            invExit.x = b.min.x - a.max.x;
        }

        if(velocity.y > 0){
            invEntry.y = b.min.y - a.max.y;
            invExit.y = b.max.y - a.min.y;
        }
        else{
            invEntry.y = b.max.y - a.min.y;
            invExit.y = b.min.y - a.max.y;
        }

        if(velocity.z > 0){
            invEntry.z = b.min.z - a.max.z;
            invExit.z = b.max.z - a.min.z;
        }
        else{
            invEntry.z = b.max.z - a.min.z;
            invExit.z = b.min.z - a.max.z;
        }

        // find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
        let entry = new THREE.Vector3();
        let exit = new THREE.Vector3();

        if (velocity.x === 0){
            entry.x = -Infinity;
            exit.x = Infinity;
        }
        else{
            entry.x = invEntry.x / velocity.x;
            exit.x = invExit.x / velocity.x;
        }

        if (velocity.y === 0){
            entry.y = -Infinity;
            exit.y = Infinity;
        }
        else{
            entry.y = invEntry.y / velocity.y;
            exit.y = invExit.y / velocity.y;
        }

        if (velocity.z === 0){
            entry.z = -Infinity;
            exit.z = Infinity;
        }
        else{
            entry.z = invEntry.z / velocity.z;
            exit.z = invExit.z / velocity.z;
        }

        // find the earliest/latest times of collision
        let entryTime = Math.max(entry.x, entry.y, entry.z);
        let exitTime = Math.min(exit.x, exit.y, exit.z);

        // if there was no collision
        //if the entryTime is > 1 dont go any further then the velocity
        //if the entryTime is < 0 that means there was no collision
        //if the entryTime is greater then the exit time, something got messed up
        if(entryTime > exitTime || entryTime > 1 || entryTime < 0){
            return {
            	entryTime: 1,
            	exitTime: Infinity,
            	normal: normal,
            	invEntry: invEntry,
            	invExit: invExit,
            	entry: entry,
            	exit: exit
            };
        }
        else{ // if there was a collision
            // calculate normal of collided surface
            if(entry.y > entry.x && entry.y > entry.z){
                normal.x = 0;
                normal.y = (velocity.y < 0)? 1 : -1;
                normal.z = 0;
            }
            else if(entry.x > entry.y && entry.x > entry.z){
                normal.x = (velocity.x < 0)? 1 : -1;
                normal.y = 0;
                normal.z = 0;
            }
            else if(entry.z > entry.x && entry.z > entry.y){
                normal.x = 0;
                normal.y = 0;
                normal.z = (velocity.z < 0)? 1 : -1;
            }
            else{ //looks like two sides collided at the same time
                if(Math.abs(velocity.y) < Math.abs(velocity.x) && Math.abs(velocity.y) < Math.abs(velocity.z)){
                    normal.x = 0;
                    normal.y = (velocity.y < 0)? 1 : -1;
                    normal.z = 0;
                }
                else if(Math.abs(velocity.x) < Math.abs(velocity.y) && Math.abs(velocity.x) < Math.abs(velocity.z)){
                    normal.x = (velocity.x < 0)? 1 : -1;
                    normal.y = 0;
                    normal.z = 0;
                }
                else if(Math.abs(velocity.z) < Math.abs(velocity.x) && Math.abs(velocity.z) < Math.abs(velocity.y)){
                    normal.x = 0;
                    normal.y = 0;
                    normal.z = (velocity.z < 0)? 1 : -1;
                }
            }

            // return the entryTime of collision
            return {
            	entryTime: entryTime,
            	exitTime: exitTime,
            	normal: normal,
            	invEntry: invEntry,
            	invExit: invExit,
            	entry: entry,
            	exit: exit
            };
        }
    }
}
