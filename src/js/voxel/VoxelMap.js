import THREE from 'three';
import VoxelChunk from './VoxelChunk.js';
import VoxelBlock from './VoxelBlock.js';
import VoxelBlockManager from './VoxelBlockManager.js';

/**
 * @name VoxelMap
 * @class
 * @extends {THREE.Group}
 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst]
 */
export default class VoxelMap extends THREE.Group{
	constructor(blockManager = VoxelBlockManager.inst){
		super();

		/**
		 * the block manager this map will use
		 * @default {@link VoxelBlockManager.inst}
		 * @var {VoxelBlockManager}
		 */
		this.blockManager = blockManager;

		/**
		 * a Map of VoxelChunk with the keys being a string "x,y,z"
		 * @var {Map}
		 * @private
		 */
		this.chunks = new Map();

		/**
		 * a WeakMap of THREE.Vector3 with the keys being the chunks
		 * @private
		 * @var {WeakMap}
		 */
		this.chunksPositions = new WeakMap();

		/**
		 * the size of the blocks in this map.
		 * NOTE: you will have to manualy rebuild all the maps chunks if this is changed
		 * @type {THREE.Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new THREE.Vector3(32,32,32);

		/**
		 * the size of the chunks in this map.
		 * NOTE: you will have to manualy remove and recreate all the chunks in the map if this is changed
		 * @type {THREE.Vector3}
		 * @default [8,8,8]
		 */
		this.chunkSize = new THREE.Vector3(8,8,8);

		/**
		 * a WeakMap that is used by the chunks to cache the visibility of blocks
		 * @type {WeakMap}
		 * @private
		 */
		this.blockVisibilityCache = new WeakMap();

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @var {THREE.Vector3}
		 * @private
		 */
		this.tmpVec = new THREE.Vector3();
	}

	/**
	 * creates or gets the chunk at position and returns it
	 * @param  {(THREE.Vector3|String)} position
	 * @return {VoxelChunk}
	 */
	createChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
			let chunk = this.chunks.get(pos.toArray().join(','));
			if(chunk)
				return chunk;
			else{
				chunk = new VoxelChunk();
				this.setChunk(chunk, pos);
				return chunk;
			}
		}
	}

	/**
	 * checks to see if this map has a chunk at position
	 * @param  {(THREE.Vector3|String)} position
	 * @return {Boolean}
	 */
	hasChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
			return !!this.chunks.has(pos.toArray().join(','));
		}
		else if(pos instanceof VoxelChunk){
			// check to see if we have this chunk
			let chunks = this.listChunks();
			for(let chunk of chunks){
				if(chunk === pos)
					return true;
			}
		}
		return false;
	}

	/**
	 * returns the chunk at "position".
	 * @param  {THREE.Vector3|String|VoxelChunk} position
	 * @return {VoxelChunk}
	 */
	getChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
			return this.chunks.get(pos.toArray().join(','));
		}
		else if(pos instanceof VoxelChunk){
			if(this.hasChunk(pos))
				return pos;
		}
	}

	/**
	 * returns the position of the chunk in this map
	 * @param  {VoxelChunk} chunk
	 * @return {THREE.Vector3}
	 */
	getChunkPosition(chunk){
		return this.chunksPositions.get(chunk);
	}

	/**
	 * @param {VoxelChunk|Object} chunk a {@link VoxelChunk} or a Object to pass to {@link VoxelChunk#fromJSON}
	 * @param {(THREE.Vector3|String)} position
	 * @returns {this}
	 */
	setChunk(chunk,pos){
		if(!chunk instanceof VoxelChunk)
			chunk = new VoxelChunk().fromJSON(chunk);

		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = this.tmpVec.copy(pos).round();
			this.chunks.set(pos.toArray().join(','),chunk);
			this.chunksPositions.set(chunk, pos.clone());

			this.add(chunk);
			chunk.position.copy(pos).multiply(this.chunkSize).multiply(this.blockSize);
			chunk.map = this;
		}

		return this;
	}

	/**
	 * removes all the chunks in this map
	 * @return {this}
	 */
	clearChunks(){
		this.listChunks().forEach(c => c.parent = undefined);
		this.chunks.clear();

		return this;
	}

	/**
	 * removes a chunk from the map
	 * @param  {THREE.Vector3|String|VoxelChunk} posision - ths position of the chunk to remove. or the {@link VoxelChunk} to remove
	 * @return {this}
	 */
	removeChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = this.tmpVec.fromArray(pos.split(','));

		if(this.hasChunk(pos)){
			let chunk;
			if(pos instanceof THREE.Vector3){
				chunk = this.getChunk(pos);
			}
			else if(pos instanceof VoxelChunk){
				chunk = pos;
			}

			// remove it from the maps
			this.chunks.delete(chunk.chunkPosition.toArray().join(','));
			this.chunksPositions.delete(chunk);

			chunk.map = undefined;
			chunk.position.set(0,0,0);
			this.remove(chunk);
		}

		return this;
	}

	/**
	 * returns an Array of all the chunks in this map
	 * @return {VoxelChunk[]}
	 */
	listChunks(){
		return Array.from(this.chunks).map(d => d[1]);
	}

	/**
	 * creates a block with id and adds it to the map
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
	 * checks to see if we have a block at position, or if the block is in this map
	 * @param  {THREE.Vector3|String|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(',')); // dont use tmpVec here

		if(pos instanceof THREE.Vector3){
			let chunkPos = this.tmpVec.copy(pos).divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);
			if(chunk)
				return chunk.hasBlock(this.tmpVec.copy(pos).sub(chunk.worldPosition));
		}
		else if(pos instanceof VoxelBlock){
			// check to see if we have this chunk
			let chunks = this.listChunks();
			for(let chunk of chunks){
				if(chunk.hasBlock(pos))
					return true;
			}
		}
		return false;
	}

	/**
	 * returns the block at "position". or check to see if a block is part of this map
	 * @param  {THREE.Vector3|String|VoxelBlock} position - the position of the block (in blocks), or the VoxelBlock to check for
	 * @return {VoxelBlock}
	 */
	getBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(',')); // dont use tmpVec here

		if(pos instanceof THREE.Vector3){
			let chunkPos = this.tmpVec.copy(pos).divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);
			if(chunk)
				return chunk.getBlock(this.tmpVec.copy(pos).sub(chunk.worldPosition));
		}
		else if(pos instanceof VoxelBlock){
			let chunks = this.listChunks();
			for(let chunk of chunks){
				if(chunk.hasBlock(pos))
					return pos;
			}
		}
	}

	/**
	 * @param {VoxelBlock|String} block - a {@link VoxelBlock} or a UID of a block to create
	 * @param {THREE.Vector3|String} position
	 * @returns {this}
	 */
	setBlock(block,pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(',')); // dont use tmpVec here

		if(pos instanceof THREE.Vector3){
			let chunkPos = this.tmpVec.copy(pos).divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);

			if(!chunk){
				//create a new chunk
				chunk = new VoxelChunk();
				this.setChunk(chunk, chunkPos);
			}

			chunk.setBlock(block, this.tmpVec.copy(pos).sub(chunk.worldPosition));
		}

		return this;
	}

	/**
	 * removes all the blocks in this map, but keeps the chunks
	 * @return {this}
	 */
	clearBlocks(){
		this.listChunks().forEach(chunk => {
			chunk.clearBlocks();
		})

		return this;
	}

	/**
	 * removes a block from the map
	 * @param  {THREE.Vector3|String|VoxelBlock} posision
	 * @return {this}
	 */
	removeBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			let chunkPos = this.tmpVec.copy(pos).divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);

			if(chunk)
				chunk.removeBlock(this.tmpVec.copy(pos).sub(chunk.worldPosition));
		}
		else if(pos instanceof VoxelBlock){
			let chunks = this.listChunks();
			for(let chunk of chunks){
				if(chunk.hasBlock(pos))
					chunk.removeBlock(pos);
			}
		}

		return this;
	}

	/**
	 * exports map to json format
	 * @return {Object}
	 */
	toJSON(){
		let json = {};
		json.chunks = Array.from(this.chunks).map(chunk => {
			chunk[1] = chunk[1].toJSON();
			return chunk;
		})
		return json;
	}

	/**
	 * imports chunks / blocks from json format
	 * @param  {Object} json
	 * @return {this}
	 */
	fromJSON(json){
		if(json.chunks){
			json.chunks.forEach(data => {
				let chunk = new VoxelChunk();
				this.setChunk(chunk,data[0]);

				//import the blocks after we add the chunk to the map, that way the chunk can access the blockManager
				chunk.fromJSON(data[1]);
			})
		}

		return this;
	}

	/**
	 * loops over all the chunks in the map and rebuilds them if they need it
	 * @returns {this}
	 */
	updateChunks(){
		this.listChunks().forEach(chunk => {
			if(chunk.needsBuild)
				chunk.build();
		})
		return this;
	}
}
