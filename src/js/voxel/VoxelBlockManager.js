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
	 * @param  {String|VoxelBlock|Class} - a UID of a block or a {@link VoxelBlock} or a class
	 * @return {Boolean}
	 */
	hasBlock(id){
		if(String.isString(id)){
			return this.blocks.has(VoxelBlockManager.resolveID(id));
		}
		else {
			for(let [UID, block] of this.blocks){
				if(id instanceof block || id === block){
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * returns the block class registered with that UID
	 * @param  {String|VoxelBlock|Class} id - a UID of a block or a instance of a {@link VoxelBlock} or a class
	 * @return {VoxelBlock} returns a {@link VoxelBlock} class
	 */
	getBlock(id){
		if(String.isString(id)){
			return this.blocks.get(VoxelBlockManager.resolveID(id));
		}
		else{
			for(let [UID, block] of this.blocks){
				if(id instanceof block || id === block){
					return block;
				}
			}
		}
	}

	/**
	 * gets a block from the pool or creates a new one
	 * @param  {String|VoxelBlock|Class} id - the UID of the block to create
	 * @param  {Object} props - a object that is passed to {@link VoxelBlock#setProp}
	 * @return {VoxelBlock} returns a {@link VoxelBlock} instance
	 */
	createBlock(id, props){
		// if the id is a string get the props out of it
		if(String.isString(id)){
			if(props)
				props = Object.assign({}, props, VoxelBlockManager.parseProps(id));
			else
				props = Object.assign({}, VoxelBlockManager.parseProps(id));
		}

		id = VoxelBlockManager.resolveID(id);
		if(this.usePool)
			return this.newBlock(id, props);
		else
			return this._createBlock(id, props);
	}

	/**
	 * returns a clone of the block
	 * @param  {VoxelBlock} block
	 * @return {VoxelBlock}
	 */
	cloneBlock(block){
		let newBlock = this.createBlock(block);
		if(block.hasOwnProperty('properties')){
			let props = {};
			Reflect.ownKeys(block.properties).forEach(key => props[key] = block.properties[key]);
			newBlock.setProp(props);
		}
		return newBlock;
	}

	/**
	 * returns a new block
	 * @param  {String|VoxelBlock|Class} id - the UID of the block to create
	 * @param  {Object} props - a object that is passed to {@link VoxelBlock#setProp}
	 * @private
	 * @return {VoxelBlock}
	 */
	_createBlock(id, props){
		if(this.hasBlock(id)){
			let block = new (this.getBlock(id));
			if(props)
				block.setProp(props);

			return block;
		}
	}

	/**
	 * registers a block class with this manager
	 * @param  {VoxelBlock|VoxelBlock[]|Object}
	 * @return {this}
	 */
	registerBlock(block){
		if(this.hasBlock(block))
			return this;

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
	 * returns the UID of the block, if the block is not in the manager it will still return the blocks UID
	 * @param  {String|VoxelBlock|Class} id - a UID of a block or a instance of a {@link VoxelBlock} or a class
	 * @return {String}
	 * @static
	 */
	static resolveID(id){
		// if its a string, extract the id out of the string just in case there are properties in the string
		if(String.isString(id))
			return id.match(/^[^\?]+(?=\?)?/)[0];
		else if(Function.isFunction(id))
			return id.UID;
		else if(id instanceof VoxelBlock)
			return id.constructor.UID;
	}

	/**
	 * returns the id with the props appended onto it
	 * @param  {String|VoxelBlock|Class} id
	 * @param  {Object} props
	 * @return {String}
	 * @static
	 */
	static createID(id, props){
		props = props || {};
		let blockID = VoxelBlockManager.resolveID(id);
		if(String.isString(id)){
			Object.assign(props, VoxelBlockManager.parseProps(id));
		}
		else if(id instanceof VoxelBlock && id.hasOwnProperty('properties')){
			Reflect.ownKeys(id.properties).forEach(key => {
				props[key] = id.getProp(key);
			})
		}
		let a = [];
		for(let i in props){
			a.push(`${i}=${props[i]}`);
		}
		return a.length? blockID+'?'+a.join('&') : blockID;
	}

	/**
	 * returns a object with all the props that are in this id string.
	 * props are in url search parameter format
	 * @param  {String} id
	 * @return {Object}
	 * @static
	 *
	 * @example
	 * "glass?type=green"
	 * "dirt?rotation=[1,0,0]"
	 */
	static parseProps(id){
		return URL.parseSearch(id);
	}

	/**
	 * get a new block of "type" from the pool.
	 * if there is none it will create one
	 * @param  {String} id - the UID of the block to create
	 * @param  {Object} props - a object that is passed to {@link VoxelBlock#setProp}
	 * @return {VoxelBlock}
	 */
	newBlock(id, props){
		// if the id is a string get the props out of it
		if(String.isString(id)){
			if(props)
				props = Object.assign({}, props, VoxelBlockManager.parseProps(id));
			else
				props = Object.assign({}, VoxelBlockManager.parseProps(id));
		}

		id = VoxelBlockManager.resolveID(id);
		if(id && this.blockPool[id]){
			let block;
			while(block = this.blockPool[id].shift()){
				// make sure the block dose not have a parent before we use it
				if(!block.parent)
					break;
			}

			if(!block){
				// looks like we can out of blocks in the pool, create a new one
				block = this._createBlock(id, props);
			}

			if(props)
				block.setProp(props);

			return block;
		}

		return this._createBlock(id, props);
	}

	/**
	 * removes block from its parent and adds it back into the pool
	 * @param {VoxelBlock} block
	 * @return {this}
	 */
	disposeBlock(block){
		let id = VoxelBlockManager.resolveID(block);
		if(id && block instanceof VoxelBlock){
			this._resetBlock(block);
			if(!this.blockPool[id])
				this.blockPool[id] = [];

			this.blockPool[id].push(block);
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
