import { Quaternion, Vector4, Vector3 } from "three";
import * as ChunkUtils from "../ChunkUtils.js";
import VoxelSelection from "../voxel/VoxelSelection.js";
import MazeGenerator from "../maze-generators/MazeGenerator.js";
import voxelSerializer from "../voxel/serializer";

export const ROOM_ROTATION_AXIS = new Vector3(0, 1, 0);

export default class Room {
	/**
	 * @param {VoxelSelectionJSON} blocks
	 * @param {any} doors
	 * @param {RoomManager} manager
	 */
	constructor(blocks, doors, manager) {
		/**
		 * the parent room manager class
		 * @type {RoomManager}
		 */
		this.manager = manager;

		/**
		 * @type {VoxelSelectionJSON}
		 * @private
		 */
		this.blocks = blocks;

		/** @private */
		this.rawDoors = doors || new Vector3();

		/** @type {RoomMaze} */
		this.parent = undefined;

		/**
		 * the rotation (in quarter turns) of the room of the Y axis
		 * @type {Number}
		 */
		this.rotation = 0;
	}

	get position() {
		return this.parent.getRoomPosition(this);
	}

	/**
	 * returns this rooms VoxelSelection with its rotation applied
	 * @return {VoxelSelection}
	 */
	get selection() {
		if (!this._selection) {
			if (this.blocks) {
				this._selection = voxelSerializer.VoxelSelection.fromJSON(this.blocks, this.blockManager);

				// rotate the blocks
				if (this.rotation !== 0) {
					let quaternion = new Quaternion().setFromAxisAngle(ROOM_ROTATION_AXIS, (Math.PI / 2) * this.rotation);
					ChunkUtils.rotateBlocks(
						this._selection,
						this._selection.boundingBox,
						Room.SIZE.clone().divideScalar(2),
						quaternion,
						{
							ignoreEmpty: true
						}
					);
				}
			} else {
				this._selection = new VoxelSelection(this.blockManager);
			}
		}

		return this._selection;
	}

	/**
	 * returns the size of the room in blocks
	 * @return {Vector3}
	 */
	get size() {
		return Room.SIZE;
	}

	/**
	 * returns the doors with the rotation applied
	 * @return {Vector4}
	 */
	get doors() {
		return this.rawDoors ? Room.rotateDoors(this.rawDoors, this.rotation) : new Vector4();
	}

	/**
	 * returns the parent room managers blockManager
	 * @return {VoxelBlockManager}
	 */
	get blockManager() {
		return this.manager && this.manager.blockManager;
	}

	static rotateDoors(vec, rotation) {
		let vec3 = new Vector3().copy(vec);
		vec3
			.applyAxisAngle(ROOM_ROTATION_AXIS, (Math.PI / 2) * rotation)
			.round()
			.map(v => {
				if (v < 0)
					return (
						(Math.abs(v) & Room.DOOR_POSITIVE ? Room.DOOR_NEGATIVE : Room.DOOR_NONE) |
						(Math.abs(v) & Room.DOOR_NEGATIVE ? Room.DOOR_POSITIVE : Room.DOOR_NONE)
					);
				else return v;
			});
		return new Vector4(vec3.x, vec3.y, vec3.z, vec.w);
	}
}

Room.SIZE = new Vector3(32, 16, 32);
Room.DOOR_NONE = MazeGenerator.DOOR_NONE;
Room.DOOR_POSITIVE = MazeGenerator.DOOR_POSITIVE;
Room.DOOR_NEGATIVE = MazeGenerator.DOOR_NEGATIVE;
