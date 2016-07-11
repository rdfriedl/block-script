/**
 * @class manages a list of voxels blocks, and provides functions for creating them
 * @name VoxelBlockManager
 */
export default class VoxelBlockManager{
	/**
	 * returns an instance of a VoxelBlockManager
	 * @static
	 * @name inst
	 * @return {VoxelBlockManager}
	 * @memberOf VoxelBlockManager
	 */
	static get inst(){return this._inst || (this._inst = new this())}

	constructor(){
		/**
		 * a Map of blocks with the key being the UID
		 * @var {Map}
		 * @private
		 */
		this.blocks = new Map();

		/**
		 * a pool of blocks to pull from
		 * @var {Object}
		 * @private
		 */
		this.blockPool = new Object();

		/**
		 * whether to use the blockPool
		 * @var {Boolean}
		 * @default false
		 */
		this.usePool = false;
	}

	/**
	 * @param  {VoxelBlock|String} - a UID of a block or a {@link VoxelBlock} class
	 * @return {Boolean}
	 */
	hasBlock(id){
		if(id instanceof VoxelBlock){
			let blocks = this.blocks.values();
			let block;
			while(block = blocks.next()){
				if(id instanceof block || id === block)
					return true;
			}
		}
		else if(this.blocks.has(id)){
			return true;
		}
		return false;
	}

	/**
	 * returns the block class registered with that UID
	 * @param  {String} id - a UID of a block
	 * @return {VoxelBlock}
	 */
	getBlock(id){
		if(this.hasBlock(id)){
			return this.blocks.get(id);
		}
	}

	/**
	 * gets a block from the pool or creates a new one
	 * @param  {String} id - the UID of the block to create
	 * @param {Object} data - a object that is passed to {@link VoxelBlock#fromJSON}
	 * @return {VoxelBlock}
	 */
	createBlock(id, data){
		if(this.usePool)
			return this.newBlock(id, data);
		else
			return this._createBlock(id, data);
	}

	/**
	 * returns a new block
	 * @param  {String} id - the UID of the block to create
	 * @param  {Object} data - a object that is passed to {@link VoxelBlock#fromJSON}
	 * @private
	 * @return {VoxelBlock}
	 */
	_createBlock(id, data){
		if(this.hasBlock(id))
			return new (this.getBlock(id))(data);
	}

	/**
	 * registers a block class with this manager
	 * @param  {VoxelBlock|VoxelBlock[]|Object}
	 * @return {this}
	 */
	registerBlock(block){
		if(Function.isFunction(block) && block.UID){
			this.blocks.set(block.UID, block);
		}
		else if(Array.isArray(block)){
			block.forEach(block => this.blocks.set(block.UID, block));
		}
		else if(Object.isObject(block)){
			for(let i in block){
				this.blocks.set(block[i].UID, block[i])
			}
		}

		return this;
	}

	/**
	 * returns an array of all the VoxelBlocks registered
	 * @return {VoxelBlox[]}
	 */
	listBlocks(){
		let arr = [];
		this.blocks.forEach(b => arr.push(b));
		return arr;
	}

	/**
	 * get a new block of "type" from the pool.
	 * if there is none it will create one
	 * @param  {String} id - the UID of the block to create
	 * @param  {Object} data - a object that is passed to {@link VoxelBlock#fromJSON}
	 * @return {VoxelBlock}
	 */
	newBlock(id, data){
		if(this.blockPool[id]){
			let block = this.blockPool[id].shift();
			if(block && data)
				block.fromJSON(data);

			return block || this._createBlock(id, data);
		}

		return this._createBlock(id, data);
	}

	/**
	 * removes block from its parent and adds it back into the pool
	 * @return {this}
	 */
	disposeBlock(block){
		if(block instanceof VoxelBlock){
			this._resetBlock(block);
			if(!this.blockPool[block.id])
				this.blockPool[block.id] = [];

			this.blockPool[block.id].push(block);
		}
		return this;
	}

	/**
	 * resets a block before putting it back in the pool
	 * @param  {VoxelBlock} block
	 * @return {this}
	 */
	_resetBlock(block){
		if(block.hasOwnProperty('properties'))
			delete block.properties;

		if(block.parent)
			block.parent.removeBlock(block);

		return this;
	}
}

//import block for runtime
import VoxelBlock from './VoxelBlock.js';
