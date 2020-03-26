import { Box3, Vector3 } from "three";
import CollisionEntity from "../CollisionEntity.js";

/**
 * @desc a compound collision entity
 * @todo make it possible to have non-static CollisionEntityCompound
 */
export default class CollisionEntityCompound extends CollisionEntity {
	constructor(entities) {
		super();

		this.isStatic = true;

		/**
		 * CollisionEntity that make up this entity
		 * @type {CollisionEntity[]}
		 */
		this.entities = [];

		if (entities) {
			for (let i = 0; i < entities.length; i++) {
				if (entities[i] instanceof CollisionEntity) this.entities.push(entities[i]);
			}
		}
	}

	/**
	 * @override
	 */
	getBoundingBox() {
		let box = new Box3(new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity));
		this.entities.forEach((entity) => {
			box.merge(entity.boundingBox);
		});
		return box;
	}

	/**
	 * @override
	 */
	getCollisionData(entity, velocity, movementBox) {
		if (entity instanceof CollisionEntityBox) {
			let collision;

			// test for and find the first collision
			for (let i = 0; i < this.entities.length; i++) {
				let entity = this.entities[i],
					col;

				if (entity instanceof CollisionEntityBox) {
					col = CollisionEntityBox.SweptAABB(entity.box, entity.box, velocity);
				} else if (entity instanceof CollisionEntityPoint) {
					// TODO: make box -> point collision
				}

				// if there was a collision
				if (col && (!collision || col.entryTime < collision.entryTime)) {
					collision = col;
				}
			}

			if (collision)
				return {
					entryTime: collision.entryTime == 1 ? Infinity : collision.entryTime,
					exitTime: collision.exitTime,
					normal: collision.normal,
				};
		} else if (entity instanceof CollisionEntityPoint) {
			let collision;

			// test for and find the first collision
			for (let i = 0; i < this.entities.length; i++) {
				let enty = this.entities[i],
					col;

				if (enty instanceof CollisionEntityBox) {
					col = CollisionEntityPoint.SweptAABB(entity.position, enty.box, velocity);
				} else if (enty instanceof CollisionEntityPoint) {
					// TODO: make box -> point collision
				}

				// if there was a collision
				if (col && (!collision || col.entryTime < collision.entryTime)) {
					collision = col;
				}
			}

			if (collision)
				return {
					entryTime: collision.entryTime == 1 ? Infinity : collision.entryTime,
					exitTime: collision.exitTime,
					normal: collision.normal,
				};
		} else if (entity instanceof CollisionEntityCompound) {
			// TODO: make comound -> compound collisions
		}

		return super.getCollisionData(entity, velocity, movementBox);
	}
}

import CollisionEntityBox from "./box.js";
import CollisionEntityPoint from "./point.js";
