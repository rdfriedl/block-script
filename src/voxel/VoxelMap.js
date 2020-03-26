import { Group, Vector3 } from "three";
import "../three-changes";
import VoxelChunk from "./VoxelChunk.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";

/** the base class for the voxel map */
export default class VoxelMap extends Group {
	/**
	 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst]
	 */
	constructor(blockManager = VoxelBlockManager.inst) {
		super();

		/**
		 * the block manager this map will use
		 * @default {@link VoxelBlockManager.inst}
		 * @type {VoxelBlockManager}
		 */
		this.blockManager = blockManager;

		/**
		 * a Map of VoxelChunk with the keys being a string "x,y,z"
		 * @type {Map<string, VoxelChunk>}
		 * @private
		 */
		this.chunks = new Map();

		/**
		 * a WeakMap of Vector3 with the keys being the chunks
		 * @private
		 * @type {WeakMap}
		 */
		this.chunksPositions = new WeakMap();

		/**
		 * the size of the blocks in this map.
		 * NOTE: you will have to manually rebuild all the maps chunks if this is changed
		 * @type {Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new Vector3(32, 32, 32);

		/**
		 * the size of the chunks in this map.
		 * NOTE: you will have to manually remove and recreate all the chunks in the map if this is changed
		 * @type {Vector3}
		 * @default [8,8,8]
		 */
		this.chunkSize = new Vector3(8, 8, 8);

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @type {Vector3}
		 * @todo make it so every function has a tmp vec
		 * @private
		 */
		this.tmpVec = new Vector3();

		/**
		 * whether the chunks should use the block neighbor cache
		 * @type {Boolean}
		 * @default true
		 */
		this.useNeighborCache = true;
	}

	name = 'VoxelMap';

	/**
	 * creates or gets the chunk at position and returns it
	 * @param  {(Vector3)} position
	 * @return {VoxelChunk}
	 */
	createChunk(position) {
		if (position instanceof Vector3) {
			position = this.tmpVec.copy(position).round();
			let chunk = this.chunks.get(position.toString());
			if (chunk) return chunk;
			else {
				chunk = new VoxelChunk();
				this.setChunk(chunk, position);
				return chunk;
			}
		}
	}

	/**
	 * checks to see if this map has a chunk at position
	 * @param  {(Vector3)} position
	 * @return {Boolean}
	 */
	hasChunk(position) {
		if (position instanceof Vector3) {
			position = this.tmpVec.copy(position).round();
			return this.chunks.has(position.toString());
		} else if (position instanceof VoxelChunk) {
			// check to see if we have this chunk
			let chunks = this.listChunks();
			for (let i in chunks) {
				if (chunks[i] === position) return true;
			}
		}
		return false;
	}

	/**
	 * returns the chunk at "position".
	 * @param  {Vector3} position
	 * @return {VoxelChunk}
	 */
	getChunk(position) {
		return this.chunks.get(position.toString());
	}

	/**
	 * gets for creates a chunk at position
	 * @param {Vector3} position
	 * @return {VoxelChunk}
	 */
	getOrCreateChunk(position) {
		if (this.hasChunk(position)) {
			return this.getChunk(position);
		} else {
			return this.createChunk(position);
		}
	}

	/**
	 * returns the position of the chunk in this map
	 * @param  {VoxelChunk} chunk
	 * @return {Vector3}
	 */
	getChunkPosition(chunk) {
		return this.chunksPositions.get(chunk);
	}

	/**
	 * @param {VoxelChunk} chunk
	 * @param {Vector3} position
	 * @return {VoxelMap} this
	 *
	 * @emits {chunk:set}
	 */
	setChunk(chunk, position) {
		position = this.tmpVec.copy(position).round();
		let str = position.toString();
		let oldChunk = this.chunks.get(str);
		this.chunks.set(str, chunk);
		this.chunksPositions.set(chunk, position.clone());

		this.add(chunk);
		chunk.position
			.copy(position)
			.multiply(this.chunkSize)
			.multiply(this.blockSize);
		chunk.map = this;

		// fire event
		this.dispatchEvent({
			type: "chunk:set",
			chunk: chunk,
			oldChunk: oldChunk
		});

		return this;
	}

	/**
	 * removes all the chunks and all the blocks in then from the map
	 * @param {Boolean} [disposeBlocks=true] - whether to put all the blocks in the chunk back into the blockManagers pool
	 * @return {VoxelMap} this
	 *
	 * @emits {chunks:cleared}
	 */
	clearChunks(disposeBlocks = true) {
		let chunks = this.listChunks();

		chunks.forEach(chunk => {
			chunk.clearBlocks(disposeBlocks);
			chunk.parent = undefined;
		});
		this.chunks.clear();

		// fire event
		this.dispatchEvent({
			type: "chunks:cleared",
			chunks
		});

		return this;
	}

	/**
	 * removes a chunk from the map
	 * @param  {Vector3|VoxelChunk} position - the position of the chunk to remove. or the chunk itself
	 * @return {VoxelMap} this
	 *
	 * @emits {chunk:removed}
	 */
	removeChunk(position) {
		if (!this.hasChunk(position)) return this;

		let chunk;
		if (position instanceof Vector3) {
			chunk = this.getChunk(position);
		} else if (position instanceof VoxelChunk) {
			chunk = position;
		}

		// TODO: remove all the chunks blocks from the neighbor cache and remove the edges of the chunk around this one from the cache

		// remove it from the maps
		this.chunks.delete(chunk.chunkPosition.toString());
		this.chunksPositions.delete(chunk);

		chunk.map = undefined;
		chunk.position.set(0, 0, 0);
		this.remove(chunk);

		// fire event
		this.dispatchEvent({
			type: "chunk:removed",
			chunk: chunk
		});

		return this;
	}

	/**
	 * returns an Array of all the chunks in this map
	 * @return {VoxelChunk[]}
	 */
	listChunks() {
		return Array.from(this.chunks).map(d => d[1]);
	}

	/**
	 * creates a block with id and adds it to the map
	 * @param  {String} id - the UID of the block to create
	 * @param  {Vector3} position - the position to add the block to
	 * @return {VoxelBlock}
	 */
	createBlock(id, position) {
		let block;
		if (typeof id === "string") block = this.blockManager.createBlock(id);

		if (block && position) {
			this.setBlock(block, position);
		}
		return block;
	}

	/**
	 * checks to see if we have a block at position, or if the block is in this map
	 * @param  {Vector3|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(position) {
		if (position instanceof Vector3) {
			let chunkPos = this.tmpVec
				.copy(position)
				.divide(this.chunkSize)
				.floor();

			let chunk = this.getChunk(chunkPos);

			return chunk ? chunk.hasBlock(this.tmpVec.copy(position).sub(chunk.worldPosition)) : false;
		} else if (position instanceof VoxelBlock) {
			// check to see if we have this chunk
			let chunks = this.listChunks();
			for (let chunk of chunks) {
				if (chunk.hasBlock(position)) return true;
			}
		}

		return false;
	}

	/**
	 * returns the block at "position". or check to see if a block is part of this map
	 * @param  {Vector3} position - the position of the block (in blocks), or the VoxelBlock to check for
	 * @return {VoxelBlock}
	 */
	getBlock(position) {
		if (position instanceof VoxelBlock) {
			return this.hasBlock(position) ? position : undefined;
		}

		let chunkPos = this.tmpVec
			.copy(position)
			.divide(this.chunkSize)
			.floor();

		let chunk = this.getChunk(chunkPos);

		return chunk && chunk.getBlock(this.tmpVec.copy(position).sub(chunk.worldPosition));
	}

	/**
	 * @param {VoxelBlock|String} block - a {@link VoxelBlock} or a UID of a block to create
	 * @param {Vector3} position
	 * @return {VoxelMap} this
	 */
	setBlock(block, position) {
		let chunkPos = this.tmpVec
			.copy(position)
			.divide(this.chunkSize)
			.floor();

		let chunk = this.getChunk(chunkPos);

		if (!chunk) {
			// create a new chunk
			chunk = new VoxelChunk();
			this.setChunk(chunk, chunkPos);
		}

		chunk.setBlock(block, this.tmpVec.copy(position).sub(chunk.worldPosition));

		return this;
	}

	/**
	 * removes all the blocks in this map, but keeps the chunks
	 * @param {Boolean} [disposeBlocks=true]
	 * @return {VoxelMap} this
	 */
	clearBlocks(disposeBlocks = true) {
		this.listChunks().forEach(chunk => {
			chunk.clearBlocks(disposeBlocks);
		});

		return this;
	}

	/**
	 * removes a block from the map
	 * @param  {Vector3|VoxelBlock} position
	 * @param {Boolean} [disposeBlock=true]
	 * @return {VoxelMap} this
	 */
	removeBlock(position, disposeBlock = true) {
		if (position instanceof Vector3) {
			let chunkPos = this.tmpVec
				.copy(position)
				.divide(this.chunkSize)
				.floor();

			let chunk = this.getChunk(chunkPos);

			if (chunk) {
				chunk.removeBlock(this.tmpVec.copy(position).sub(chunk.worldPosition), disposeBlock);
			}
		} else if (position instanceof VoxelBlock) {
			let block = position;
			let chunks = this.listChunks();
			for (let chunk of chunks) {
				if (chunk.hasBlock(block)) {
					chunk.removeBlock(block, disposeBlock);
					break;
				}
			}
		}

		return this;
	}

	/**
	 * loops over all the chunks in the map and rebuilds them if they need it
	 * @return {VoxelMap} this
	 */
	updateChunks() {
		this.listChunks().forEach(chunk => {
			if (chunk.needsBuild) chunk.build();
		});
		return this;
	}
}
