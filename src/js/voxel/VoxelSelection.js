import THREE from 'three';

/**
 * @class
 * @name VoxelSelection
 *
 * @extends {THREE.EventDispatcher}
 */
export default class VoxelSelection extends THREE.EventDispatcher{
	constructor(blockManager = VoxelBlockManager.inst){
		super();
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

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @var {THREE.Vector3}
		 * @private
		 */
		this.tmpVec = new THREE.Vector3();
	}

	/**
	 * fired when a block is set
	 * @event VoxelSelection#block:set
	 * @type {Object}
	 * @property {VoxelChunk} target
	 * @property {VoxelBlock} block
	 * @property {VoxelBlock} oldBlock
	 */
	/**
	 * fired when a block is removed
	 * @event VoxelSelection#block:removed
	 * @type {Object}
	 * @property {VoxelChunk} target
	 * @property {VoxelBlock} block - the block that was removed
	 */
	/**
	 * @event VoxelSelection#blocks:cleared
	 * @type {Object}
	 * @property {VoxelChunk} target
	 */

	/**
	 * checks to see if we have a block at position, or if the block is in this selection
	 * @param  {THREE.Vector3|String|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
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
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
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
			pos = this.tmpVec.fromArray(pos.split(','));

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
	 *
	 * @fires VoxelSelection#block:set
	 */
	setBlock(block,pos){
		if(String.isString(block))
			block = this.blockManager.createBlock(block);

		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3 && block instanceof VoxelBlock){
			pos = this.tmpVec.copy(pos).round();
			let str = pos.toArray().join(',');
			let oldBlock = this.blocks.get(str);
			this.blocks.set(str,block);
			this.blocksPositions.set(block, pos.clone());

			block.parent = this;

			// fire event
			this.dispatchEvent({
				type: 'block:set',
				block: block,
				oldBlock: oldBlock
			})
		}

		return this;
	}

	/**
	 * removes all blocks from this selection
	 * @return {this}
	 *
	 * @fires VoxelSelection#blocks:cleared
	 */
	clearBlocks(){
		this.listBlocks().forEach(b => b.parent = undefined);
		this.blocks.clear();

		// fire evnet
		this.dispatchEvent({
			type: 'blocks:cleared'
		})

		return this;
	}

	/**
	 * removes block at position
	 * @param  {(THREE.Vector3|String)} position
	 * @return {this}
	 *
	 * @fires VoxelSelection#block:removed
	 */
	removeBlock(pos){
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

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

			this.dispatchEvent({
				type: 'block:removed',
				block: block
			})
		}

		return this;
	}

	/**
	 * returns an Array of all the blocks in this chunk
	 * @return {VoxelChunk[]}
	 */
	listBlocks(){
		return Array.from(this.blocks).map(d => d[1]);
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
