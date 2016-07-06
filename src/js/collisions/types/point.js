import CollisionEntity from '../CollisionEntity.js';

/**
 * @class a point collition shape
 * @name CollisionEntityPoint
 * @extends {CollisionEntity}
 */
export default class CollisionEntityPoint extends CollisionEntity{
	getCollisionData(){

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
}
