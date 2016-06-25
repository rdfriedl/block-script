/**
 * @name VoxelBlockManager
 * @class
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
	}

	/**
	 * @param  {(VoxelBlock|String)} - a UID of a block or a {@link VoxelBlock}
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
	 * returns a new block
	 * @param  {String} id - the UID of the block to create
	 * @return {VoxelBlock}
	 */
	createBlock(id, data){
		if(this.hasBlock(id))
			return new (this.getBlock(id))(data);
	}

	/**
	 * registers a block class with this manager
	 * @param  {VoxelBlock|VoxelBlock[]|Object}
	 * @return {this}
	 */
	registerBlock(block){
		if(Array.isArray(block))
			block.forEach(block => this.blocks.set(block.UID, block));
		if(Object.isObject(block)){
			for(let i in block){
				this.blocks.set(block[i].UID, block[i])
			}
		}
		else
			this.blocks.set(block.UID, block);

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
}

//import block for runtime
import VoxelBlock from './VoxelBlock.js';
