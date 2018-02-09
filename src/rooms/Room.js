import THREE from "three";
import * as ChunkUtils from "../ChunkUtils.js";
import VoxelSelection from "../voxel/VoxelSelection.js";
import VoxelBlockManager from "../voxel/VoxelBlockManager.js";
import MazeGenerator from "../maze-generators/MazeGenerator.js";

export const ROOM_ROTATION_AXIS = new THREE.Vector3(0, 1, 0);

export default class Room {
	constructor(blocks, doors) {
		/**
		 * the block manager used when creating the {@link VoxelSelection} for this room
		 * @type {VoxelBlockManager}
		 */
		this.blockManager = VoxelBlockManager.inst;

		/**
		 * a object that is passed to {@link VoxelSelection#fromJSON} when creating the selection for this room
		 * @type {Object}
		 */
		this.blocks = blocks;

		this.rawDoors = doors;

		this.parent = undefined;

		/**
		 * the rotation (in quater turns) of the room of the Y axis in radians
		 * @type {Number}
		 */
		this.rotation = 0;
	}

	get position() {
		return this.parent.getRoomPosition(this);
	}

	get visited() {
		return this.parent.getRoomVisited(this);
	}

	set visited(visited) {
		this.parent.getRoomVisited(this, visited);
		return visited;
	}

	/**
	 * returns this rooms VoxelSelection with its rotation applied
	 * @return {VoxelSelection}
	 */
	get selection() {
		if (!this._selection) {
			this._selection = new VoxelSelection(this.blockManager);

			if (this.blocks) {
				this._selection.fromJSON(this.blocks);

				// rotate the blocks
				if (this.rotation != 0) {
					let quat = new THREE.Quaternion().setFromAxisAngle(
						ROOM_ROTATION_AXIS,
						Math.PI / 2 * this.rotation,
					);
					ChunkUtils.rotateBlocks(
						this._selection,
						this._selection.boundingBox,
						Room.SIZE.clone().divideScalar(2),
						quat,
						{
							ignoreEmpty: true,
						},
					);
				}
			}
		}
		return this._selection;
	}

	/**
	 * returns the size of the room in blocks
	 * @return {THREE.Vecotr3}
	 */
	get size() {
		return Room.SIZE;
	}

	/**
	 * returns the doors with the rotation applied
	 * @return {THREE.Vector4}
	 */
	get doors() {
		return this.rawDoors
			? Room.rotateDoors(this.rawDoors, this.rotation)
			: new THREE.Vector4();
	}

	static rotateDoors(vec, rotation) {
		let vec3 = new THREE.Vector3().copy(vec);
		vec3
			.applyAxisAngle(ROOM_ROTATION_AXIS, Math.PI / 2 * rotation)
			.round()
			.map(v => {
				if (v < 0)
					return (
						(Math.abs(v) & Room.DOOR_POSITIVE
							? Room.DOOR_NEGATIVE
							: Room.DOOR_NONE) |
						(Math.abs(v) & Room.DOOR_NEGATIVE
							? Room.DOOR_POSITIVE
							: Room.DOOR_NONE)
					);
				else return v;
			});
		return new THREE.Vector4(vec3.x, vec3.y, vec3.z, vec.w);
	}
}

Room.SIZE = new THREE.Vector3(32, 16, 32);
Room.DOOR_NONE = MazeGenerator.DOOR_NONE;
Room.DOOR_POSITIVE = MazeGenerator.DOOR_POSITIVE;
Room.DOOR_NEGATIVE = MazeGenerator.DOOR_NEGATIVE;
