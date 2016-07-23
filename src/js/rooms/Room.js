import THREE from 'three';
import VoxelSelection from '../voxel/VoxelSelection.js';
import VoxelBlockManager from '../voxel/VoxelBlockManager.js';

export default class Room{
	constructor(blocks, doors){
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

		this.doors = doors;

		this.parent = undefined;
	}

	get position(){
		return this.parent.getRoomPosition(this);
	}

	get selection(){
		if(!this._selection){
			this._selection = new VoxelSelection(this.blockManager);

			if(this.blocks)
				this._selection.fromJSON(this.blocks);
		}
		return this._selection;
	}

	get size(){
		return Room.SIZE;
	}
}

Room.SIZE = new THREE.Vector3(32,16,32);
