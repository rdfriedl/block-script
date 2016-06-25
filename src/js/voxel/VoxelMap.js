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
		 * NOTE: you will have to manualy rebuild the map if this is changed
		 * @type {THREE.Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new THREE.Vector3(32,32,32);

		/**
		 * the size of the chunks in this map.
		 * NOTE: you will have to manualy remove and recreate all the chunks in the map if this is changed
		 * @type {THREE.Vector3}
		 * @default [10,10,10]
		 */
		this.chunkSize = new THREE.Vector3(10,10,10);
	}

	/**
	 * creates or gets the chunk at position and returns it
	 * @param  {(THREE.Vector3|String)} position
	 * @return {VoxelChunk}
	 */
	createChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
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
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			return this.chunks.has(pos.toArray().join(','));
		}
	}

	/**
	 * returns the chunk at "position".
	 * @param  {(THREE.Vector3|String)} position
	 * @return {VoxelChunk}
	 */
	getChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			return this.chunks.get(pos.toArray().join(','));
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

		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			this.chunks.set(pos.toArray().join(','),chunk);
			this.chunksPositions.set(chunk, pos);

			this.add(chunk);
			chunk.position.copy(pos.clone().multiply(this.chunkSize).multiply(this.blockSize))
			chunk.map = this;
		}

		return this;
	}

	/**
	 * removes a chunk from the map
	 * @param  {(THREE.Vector3|String)} posision
	 * @return {this}
	 */
	removeChunk(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		let chunk = this.getChunk(pos);
		if(pos instanceof THREE.Vector3 && chunk instanceof VoxelChunk){
			pos = pos.clone().round();
			this.chunks.delete(pos.toArray().join(','));
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
	 * returns the block at "position".
	 * @param  {THREE.Vector3} position - the position of the block (in blocks)
	 * @return {VoxelBlock}
	 */
	getBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			let chunkPos = pos.clone().divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);
			if(chunk)
				return chunk.getBlock(pos.clone().sub(chunk.worldPosition));
		}
	}

	/**
	 * @param {VoxelBlock} block
	 * @param {THREE.Vector3} position
	 * @returns {this}
	 */
	setBlock(block,pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			let chunkPos = pos.clone().divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);

			if(!chunk){
				//create a new chunk
				chunk = new VoxelChunk();
				this.setChunk(chunk, chunkPos);
			}

			chunk.setBlock(block, pos.clone().sub(chunk.worldPosition));
		}

		return this;
	}

	/**
	 * removes a block from the map
	 * @param  {THREE.Vector3} posision
	 * @return {this}
	 */
	removeBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			let chunkPos = pos.clone().divide(this.chunkSize).floor();
			let chunk = this.getChunk(chunkPos);

			if(chunk)
				chunk.removeBlock(pos.clone().sub(chunk.worldPosition));
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
	 */
	updateChunks(){
		this.listChunks().forEach(chunk => {
			if(chunk.needsBuild)
				chunk.build();
		})
	}
}
