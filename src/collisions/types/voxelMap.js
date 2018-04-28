import { Box3, Vector3 } from "three";
import CollisionEntity from "../CollisionEntity.js";

/** collision entity for a {@link VoxelMap} */
export default class CollisionEntityVoxelMap extends CollisionEntity {
	constructor(voxelMap) {
		if (!voxelMap) throw new Error("CollisionEntityVoxelMap requires a VoxelMap as the first argument");

		super();

		this.isStatic = true;

		/**
		 * the map to use
		 * @type {VoxelMap}
		 */
		this.map = voxelMap;
	}

	/** @override */
	getBoundingBox() {
		return new Box3(new Vector3(-Infinity, -Infinity, -Infinity), new Vector3(Infinity, Infinity, Infinity));
	}

	getCollisionData(entity, velocity, movementBox) {
		// get all the blocks in the way
		let blocks = [],
			vec = new Vector3();
		let box = movementBox.clone();
		box.min.divide(this.map.blockSize).floor();
		box.max.divide(this.map.blockSize).floor();
		for (let z = box.min.z; z <= box.max.z; z++) {
			for (let y = box.min.y; y <= box.max.y; y++) {
				for (let x = box.min.x; x <= box.max.x; x++) {
					vec.set(x, y, z);
					let block = this.map.getBlock(vec);
					if (block && block.getProp("canCollide")) blocks.push(block);
				}
			}
		}

		if (entity instanceof CollisionEntityBox) {
			let box = new Box3();
			let collision;

			// test for and find the first collision
			for (let i = 0; i < blocks.length; i++) {
				let block = blocks[i],
					scenePosition = block.scenePosition;
				box.min.copy(scenePosition);
				box.max.copy(scenePosition).add(this.map.blockSize);

				let col = CollisionEntityBox.SweptAABB(entity.box, box, velocity);

				// if there was a collision
				if (col && (!collision || col.entryTime < collision.entryTime)) {
					collision = col;
				}
			}

			if (collision)
				return {
					entryTime: collision.entryTime == 1 ? Infinity : collision.entryTime,
					exitTime: collision.exitTime,
					normal: collision.normal
				};
		} else if (entity instanceof CollisionEntityPoint) {
			let box = new Box3();
			let collision;

			// test for and find the first collision
			for (let i = 0; i < blocks.length; i++) {
				let block = blocks[i],
					scenePosition = block.scenePosition;
				box.min.copy(scenePosition);
				box.max.copy(scenePosition).add(this.map.blockSize);

				let col = CollisionEntityPoint.SweptAABB(entity.position, box, velocity);

				// if there was a collision
				if (col && (!collision || col.entryTime < collision.entryTime)) {
					collision = col;
				}
			}

			if (collision)
				return {
					entryTime: collision.entryTime == 1 ? Infinity : collision.entryTime,
					exitTime: collision.exitTime,
					normal: collision.normal
				};
		} else if (entity instanceof CollisionEntityVoxelMap) {
			// NOTE: no point in this, since two maps will never collide
		}

		return super.getCollisionData(entity, velocity, movementBox);
	}
}

import CollisionEntityBox from "./box.js";
import CollisionEntityPoint from "./point.js";
