import THREE from 'three';

/**
 * @class
 * @name VoxelSelection
 */
export default class VoxelSelection{
	constructor(blockManager = VoxelBlockManager.inst){
		/**
		 * the block manager this selection will use
		 * @default {@link VoxelBlockManager.inst}
		 * @var {VoxelBlockManager}
		 */
		this.blockManager = blockManager;

		/**
		 * a Map of VoxelBlock with the keys being a string "x,y,z"
		 * @var {Map}
		 * @private
		 */
		this.blocks = new Map();

		/**
		 * a WeakMap of THREE.Vector3 with the keys being the blocks
		 * @private
		 * @var {WeakMap}
		 */
		this.blocksPositions = new WeakMap();

		/**
		 * the size of the blocks in this selection.
		 * this is used when building this selection to a mesh
		 * @type {THREE.Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new THREE.Vector3(32,32,32);
	}

	/**
	 * checks to see if we have a block at position, or if the block is in this selection
	 * @param  {THREE.Vector3|String|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			return this.blocks.has(pos.toArray().join(','));
		}
		else if(pos instanceof VoxelBlock){
			for(let block of this.blocks){
				if(block[1] === pos)
					return true;
			}
		}
		return false;
	}

	/**
	 * returns the block at position
	 * @param  {(THREE.Vector3|String)} position
	 * @return {VoxelBlock}
	 */
	getBlock(pos){
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			return this.blocks.get(pos.toArray().join(','));
		}
		else if(pos instanceof VoxelBlock){
			if(this.hasBlock(pos))
				return pos;
		}
	}

	/**
	 * returns the position of the block in this chunk
	 * @param  {VoxelBlock} block
	 * @return {THREE.Vector3}
	 */
	getBlockPosition(block){
		return this.blocksPositions.get(block) || new THREE.Vector3();
	}

	/**
	 * creates a block with id and adds it to the selection
	 * @param  {String} id - the UID of the block to create
	 * @param  {THREE.Vector3|String} position - the position to add the block to
	 * @returns {VoxelBlock}
	 */
	createBlock(id,pos){
		let block;
		if(String.isString(id))
			block = this.blockManager.createBlock(id);

		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(block && pos){
			this.setBlock(block, pos);
		}
		return block;
	}

	/**
	 * adds a block to the chunk at position
	 * if "block" is a String it will create a new block with using {@link VoxelBlockManager#createBlock}
	 * @param {VoxelBlock|String} block
	 * @param {(THREE.Vector3|String)} position
	 * @returns {this}
	 */
	setBlock(block,pos){
		if(String.isString(block))
			block = this.blockManager.createBlock(block);

		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3 && block instanceof VoxelBlock){
			pos = pos.clone().round();
			this.blocks.set(pos.toArray().join(','),block);
			this.blocksPositions.set(block, pos);

			block.parent = this;
		}

		return this;
	}

	/**
	 * removes all blocks from this selection
	 * @return {this}
	 */
	clearBlocks(){
		this.blocks.clear();

		return this;
	}

	/**
	 * removes block at position
	 * @param  {(THREE.Vector3|String)} position
	 * @return {this}
	 */
	removeBlock(pos){
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(this.hasBlock(pos)){
			let block;
			if(pos instanceof THREE.Vector3){
				block = this.getBlock(pos.clone().round());
			}
			else if(pos instanceof VoxelBlock){
				block = pos;
			}
			if(!block) return this;

			// remove it from the maps
			this.blocks.delete(pos.toArray().join(','));
			this.blocksPositions.delete(block);

			block.parent = undefined;
		}

		return this;
	}

	/**
	 * exports chunk to json format
	 * @return {Object}
	 * @property {Array} blocks an array of Objects from {@link VoxelBlock.toJSON}
	 */
	toJSON(){
		let json = {};

		// blocks array looks like this
		/*
			[['x,y,z',block.toJSON()], ['x,y,z',block.toJSON()], ['x,y,z',block.toJSON()]]
		 */
		json.blocks = Array.from(this.blocks).map(block => {
			block[1] = block[1].toJSON();
			return block;
		});
		return json;
	}

	/**
	 * imports selection from json
	 * @param  {Object} json
	 * @param  {Object[]} json.blocks an array of objects to pass to {@link VoxelBlock.fromJSON}
	 * @return {this}
	 */
	fromJSON(json){
		if(json.blocks){
			json.blocks.forEach(data => {
				let type = data[1].type;
				let blockClass = this.blockManager.getBlock(type);
				if(blockClass){
					let block = new blockClass();
					this.setBlock(block,data[0]);
					block.fromJSON(data[1]);
				}
			})
		}

		return this;
	}

	/**
	 * @readOnly
	 * @type {Boolean}
	 */
	get empty(){
		return !this.blocks.size;
	}

	/**
	 * returns the height of the selection
	 * @return {THREE.Vector3} the height in blocks of this selection
	 * @readOnly
	 */
	get size(){
		let min = new THREE.Vector3().addScalar(Infinity), max = new THREE.Vector3().addScalar(-Infinity);
		this.blocks.forEach(block => {
			let pos = this.getBlockPosition(block);
			min.min(pos);
			max.max(pos);
		})
		return max.sub(min);
	}
}

//import block for runtime
import VoxelBlock from './VoxelBlock.js';
import VoxelBlockManager from './VoxelBlockManager.js';
