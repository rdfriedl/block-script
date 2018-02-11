import * as THREE from "three";
import "../three-changes";
import VoxelBlock from "./VoxelBlock.js";

/**
 * @typedef {Object} VoxelChunkJSON
 * @property {Array<{position: string, type: number}>} blocks - an array of positions and block types
 * @property {VoxelBlockJSON[]} types - an array of block types
 */

/** the directions of neighbors */
const NEIGHBORS_DIRS = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

/** the base class for voxel chunks */
export default class VoxelChunk extends THREE.Group {
	/**
	 * @param {Object} [data] - a json object to pass to {@link VoxelChunk#fromJSON}
	 */
	constructor(data) {
		super();

		/**
		 * a Map of VoxelBlock with the keys being a string "x,y,z"
		 * @type {Map<string, VoxelBlock>}
		 * @private
		 */
		this.blocks = new Map();

		/**
		 * a WeakMap of THREE.Vector3 with the keys being the blocks
		 * @private
		 * @type {WeakMap}
		 */
		this.blocksPositions = new WeakMap();

		/**
		 * @private
		 * @type {THREE.Mesh}
		 */
		this.mesh = undefined;

		/**
		 * the parent {@link VoxelMap}
		 * @type {VoxelMap}
		 */
		this.map = undefined;

		/**
		 * this is read by the parent map, and if its true it will trigger {@link VoxelChunk#build}
		 * @private
		 * @type {Boolean}
		 */
		this.needsBuild = false;

		/**
		 * @type {THREE.Material[]}
		 * @private
		 */
		this.materials = [];

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @type {THREE.Vector3}
		 * @private
		 */
		this.tmpVec = new THREE.Vector3();

		if (data) {
			this.fromJSON(data);
		}
	}

	/**
	 * fired when a block is set
	 * @event VoxelChunk#block:set
	 * @type {Object}
	 * @property {VoxelChunk} target
	 * @property {VoxelBlock} block
	 * @property {VoxelBlock} oldBlock
	 */
	/**
	 * fired when a block is removed
	 * @event VoxelChunk#block:removed
	 * @type {Object}
	 * @property {VoxelChunk} target
	 * @property {VoxelBlock} block - the block that was removed
	 */
	/**
	 * fired when the chunk has rebuilt its mesh
	 * @event VoxelChunk#built
	 * @type {Object}
	 * @property {VoxelChunk} target
	 */
	/**
	 * @event VoxelChunk#blocks:cleared
	 * @type {Object}
	 * @property {VoxelChunk} target
	 */

	/**
	 * updates the geometry and material for this chunk, based on the blocks
	 * @return {VoxelChunk} this
	 *
	 * @fires VoxelChunk#built
	 */
	build() {
		this.disposeGeometry();

		let geometry = new THREE.Geometry();

		// filter all the blocks
		let blocks = Array.from(this.blocks)
			.map(b => b[1])
			.filter(block => {
				if (!this.map) return true;

				// recalculate the cache if we have to
				let neighbors = VoxelChunk.BlockNeighborCache.get(block);
				if (!neighbors) {
					neighbors = {};
					NEIGHBORS_DIRS.forEach(dir => {
						this.tmpVec.fromArray(dir);
						neighbors[this.tmpVec.toString()] = block.getNeighbor(this.tmpVec);
					});

					// only add it to the cache if we are using the cache
					if (this.useNeighborCache) VoxelChunk.BlockNeighborCache.set(block, neighbors);
				}

				VoxelChunk.BuildBlockNeighborCache.set(block, neighbors);

				for (let i in neighbors) {
					if (neighbors[i] === undefined || neighbors[i].properties.transparent === true) return true;
				}
				return false;
			});

		this.materials = [];

		// merge the geometries
		let blockPositionOffset = new THREE.Vector3(0.5, 0.5, 0.5);
		let matrix = new THREE.Matrix4();
		blocks.forEach(block => {
			matrix.identity();

			// add the material
			let materialOffset = VoxelChunk.materialOffsetCache.get(block.material);
			if (materialOffset == undefined) {
				materialOffset = this.materials.length;
				if (Array.isArray(block.material)) {
					this.materials.push(...block.material);
				} else if (block.material instanceof THREE.Material) {
					this.materials.push(block.material);
				}
				VoxelChunk.materialOffsetCache.set(block.material, materialOffset);
			}

			// set rotation
			if (block.properties.rotation instanceof THREE.Euler) matrix.makeRotationFromEuler(block.properties.rotation);

			// set position
			matrix.setPosition(this.tmpVec.copy(block.position).add(blockPositionOffset));

			// merge the geometry
			if (block.geometry instanceof THREE.BoxGeometry) {
				// its just a box, loop though the faces and only add some of them
				let neighbors = VoxelChunk.BuildBlockNeighborCache.get(block);

				// merge the vertices
				let verticesOffset = geometry.vertices.length;
				for (let i in block.geometry.vertices) {
					let point = VoxelChunk.VertexPool.pop() || new THREE.Vector3();
					point.copy(block.geometry.vertices[i]).applyMatrix4(matrix);
					geometry.vertices.push(point);
				}

				// merge the faces
				block.geometry.faces.forEach((face, faceIndex) => {
					let normalString = face.normal.toString();

					// check to see if this face is visible
					if (
						neighbors[normalString] instanceof VoxelBlock == false ||
						neighbors[normalString].properties.transparent == true
					) {
						let newFace = VoxelChunk.FacePool.pop() || new THREE.Face3();
						newFace.copy(face);

						// change the points
						newFace.a += verticesOffset;
						newFace.b += verticesOffset;
						newFace.c += verticesOffset;

						// set the material
						newFace.materialIndex += materialOffset;

						// add uvs
						let UVs = [];
						for (let i = 0; i < block.geometry.faceVertexUvs[0][faceIndex].length; i++) {
							let uv = VoxelChunk.UVPool.pop() || new THREE.Vector2();
							uv.copy(block.geometry.faceVertexUvs[0][faceIndex][i]);
							UVs.push(uv);
						}
						geometry.faceVertexUvs[0].push(UVs);

						// add the face
						geometry.faces.push(newFace);
					}
				});
			} else {
				// its a diffent shape, merge everything
				if (block.material instanceof THREE.MultiMaterial) {
					geometry.merge(block.geometry, matrix, materialOffset);
				} else if (block.material instanceof THREE.Material) {
					geometry.merge(block.geometry, matrix, materialOffset);
				}
			}
		});
		VoxelChunk.materialOffsetCache.clear();
		VoxelChunk.BuildBlockNeighborCache.clear();

		geometry.mergeVertices();
		geometry.computeFaceNormals();

		if (!this.mesh) {
			this.mesh = new THREE.Mesh(geometry, this.materials);
			this.mesh.scale.multiply(this.blockSize);
			this.add(this.mesh);
		} else {
			this.mesh.geometry = geometry;
			this.mesh.geometry.needsUpdate = true;
		}

		this.needsBuild = false;

		// fire event
		this.dispatchEvent({
			type: "built",
		});

		// fire event on parent
		if (this.map && this.map.dispatchEvent)
			this.map.dispatchEvent({
				type: "chunk:built",
				chunk: this,
			});
	}

	/**
	 * dispose this chunks mesh and geometry and adds the vertices and faces into the chunk vertex and face pool
	 * @return {VoxelChunk} this
	 */
	disposeGeometry() {
		if (this.mesh) {
			this.mesh.geometry.dispose();

			this.mesh.geometry.vertices.forEach(v => VoxelChunk.VertexPool.push(v));
			this.mesh.geometry.faceVertexUvs[0].forEach(a => {
				a.forEach(uv => VoxelChunk.UVPool.push(uv));
			});
			this.mesh.geometry.faces.forEach(face => VoxelChunk.FacePool.push(face));
		}
	}

	/**
	 * checks to see if we have a block at position, or if the block is in this chunk
	 * @param  {THREE.Vector3|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(position) {
		if (position instanceof THREE.Vector3) {
			position = this.tmpVec.copy(position).round();
			return this.blocks.has(position.toString());
		} else if (position instanceof VoxelBlock) {
			for (let block of this.blocks) {
				if (block[1] === position) return true;
			}
		}
		return false;
	}

	/**
	 * returns the block at "position".
	 * if the Vector3 is negative it will get the block from the edge of the chunk
	 * @param  {(THREE.Vector3|VoxelBlock)} position
	 * @return {VoxelBlock}
	 */
	getBlock(position) {
		if (position instanceof THREE.Vector3) {
			position = this.tmpVec.copy(position).round();
			return this.blocks.get(position.toString());
		} else if (position instanceof VoxelBlock) {
			if (this.hasBlock(position)) return position;
		}
	}

	/**
	 * returns the position of the block in this chunk
	 * @param  {VoxelBlock} block
	 * @return {THREE.Vector3}
	 */
	getBlockPosition(block) {
		return this.blocksPositions.get(block) || new THREE.Vector3();
	}

	/**
	 * creates a block with id and adds it to the chunk
	 * @param  {String} id - the UID of the block to create
	 * @param  {THREE.Vector3} position - the position to add the block to
	 * @return {VoxelBlock}
	 */
	createBlock(id, position) {
		let block;
		if (typeof id === "string") block = this.map && this.map.blockManager.createBlock(id);

		if (block && position) {
			this.setBlock(block, position);
		}
		return block;
	}

	/**
	 * adds a block to the chunk at position.
	 * if "block" is a String it will create a new block with using the parents maps {@link VoxelBlockManager#createBlock}
	 * @param {VoxelBlock|String} block
	 * @param {(THREE.Vector3)} position
	 * @return {this}
	 *
	 * @fires VoxelChunk#block:set
	 */
	setBlock(block, position) {
		if (block instanceof VoxelBlock && block.parent) throw new Error("cant add block that already has a parent");

		if (typeof block === "string") block = this.map && this.map.blockManager.createBlock(block);

		if (position instanceof THREE.Vector3 && block instanceof VoxelBlock) {
			position = this.tmpVec.copy(position).round();

			// don't place the block outside of the chunk
			let chunkSize = this.chunkSize;
			if (
				position.x < 0 ||
				position.y < 0 ||
				position.z < 0 ||
				position.x >= chunkSize.x ||
				position.y >= chunkSize.y ||
				position.z >= chunkSize.z
			)
				return this;

			let str = position.toString();
			let oldBlock = this.blocks.get(str);

			// add it to this chunk
			this.blocks.set(str, block);
			this.blocksPositions.set(block, position.clone()); // clone the pos so we are not storing the original vec

			block.parent = this;

			// remove this blocks neighbors from the cache
			if (this.useNeighborCache) VoxelChunk.removeBlockFromNeighborCache(block, true);

			// tell the map that we need to rebuild this chunk
			this.needsBuild = true;

			// fire event
			this.dispatchEvent({
				type: "block:set",
				block: block,
				oldBlock: oldBlock,
			});

			// fire event on parent
			if (this.map && this.map.dispatchEvent)
				this.map.dispatchEvent({
					type: "block:set",
					chunk: this,
					block: block,
					oldBlock: oldBlock,
				});
		}

		return this;
	}

	/**
	 * removes all blocks from this chunk
	 * @param {Boolean} [disposeBlocks=true]
	 * @return {VoxelChunk} this
	 *
	 * @fires VoxelChunk#blocks:cleared
	 */
	clearBlocks(disposeBlocks = true) {
		let blocks = this.listBlocks();
		blocks.forEach(b => {
			b.parent = undefined;

			if (this.useNeighborCache) VoxelChunk.removeBlockFromNeighborCache(b, false);
		});
		this.blocks.clear();
		this.needsBuild = true;

		// add blocks to pool
		// NOTE: we have to call this AFTER we remove the block from this chunk, otherwise we get an inifite loop because the blockManager tries to remove the block
		if (disposeBlocks && this.map) blocks.forEach(block => this.map.blockManager.disposeBlock(block));

		// fire event
		this.dispatchEvent({
			type: "blocks:cleared",
		});

		// fire event on parent
		if (this.map && this.map.dispatchEvent)
			this.map.dispatchEvent({
				type: "chunk:blocks:cleared",
				chunk: this,
			});

		return this;
	}

	/**
	 * removes block at position
	 * @param  {THREE.Vector3|VoxelBlock} position - the position of the block to remove, or the {@link VoxelBlock} to remove
	 * @param {Boolean} [disposeBlock=true]
	 * @return {VoxelChunk} this
	 *
	 * @fires VoxelChunk#block:removed
	 */
	removeBlock(position, disposeBlock = true) {
		if (this.hasBlock(position)) {
			let block;
			if (position instanceof THREE.Vector3) {
				block = this.getBlock(position);
			} else if (position instanceof VoxelBlock) {
				block = position;
			}
			if (!block) return this;

			// remove it from the cache, and update its neighbors
			VoxelChunk.removeBlockFromNeighborCache(block, true);

			// remove it from the maps
			this.blocks.delete(block.position.toString());
			this.blocksPositions.delete(block);

			block.parent = undefined;

			// add blocks to pool
			// NOTE: we have to call this AFTER we remove the block from this chunk, otherwise we get an inifite loop because the blockManager tries to remove the block
			if (disposeBlock && this.map) this.map.blockManager.disposeBlock(block);

			// tell the map that we need to rebuild this chunk
			this.needsBuild = true;

			// fire event
			this.dispatchEvent({
				type: "block:removed",
				block: block,
			});

			// fire event on parent
			if (this.map && this.map.dispatchEvent)
				this.map.dispatchEvent({
					type: "block:removed",
					chunk: this,
					block: block,
				});
		}

		return this;
	}

	/**
	 * removes a block and its neighbors from the {@link VoxelChunk#BlockNeighborCache}
	 * @param {VoxelBlock} block
	 * @param {Boolean} [removeNeighbors=true]
	 * @param {Boolean} [setBuild=false] - whether to set the build flag on the parent chunk
	 * @static
	 */
	static removeBlockFromNeighborCache(block, removeNeighbors = true, setBuild = false) {
		if (block.map) {
			let neighbors = VoxelChunk.BlockNeighborCache.get(block);
			VoxelChunk.BlockNeighborCache.delete(block);

			if (removeNeighbors) {
				if (neighbors) {
					for (let i in neighbors) {
						VoxelChunk.BlockNeighborCache.delete(neighbors[i]);
						if (setBuild && neighbors[i] && neighbors[i].chunk) neighbors[i].chunk.needsBuild = true;
					}
				} else {
					block.getNeighbors().forEach(b => {
						VoxelChunk.BlockNeighborCache.delete(block);
						if (setBuild && block && block.chunk) block.chunk.needsBuild = true;
					});
				}
			}
		}
	}

	/**
	 * returns an Array of all the blocks in this chunk
	 * @return {VoxelChunk[]}
	 */
	listBlocks() {
		return Array.from(this.blocks).map(d => d[1]);
	}

	/**
	 * @param  {THREE.Vector3} direction - the direction to check
	 * @return {VoxelChunk}
	 */
	getNeighbor(direction) {
		if (this.map && direction instanceof THREE.Vector3) {
			return this.map.getChunk(this.chunkPosition.clone().add(direction));
		}
	}

	/**
	 * exports chunk to json format
	 * @return {VoxelChunkJSON}
	 */
	toJSON() {
		let json = {
			types: [],
			blocks: [],
		};

		// build list of block types
		let typeCache = new Map();

		for (let { position, block } of this.blocks) {
			let blockData = block.toJSON();
			let str = JSON.stringify(blockData);

			if (!typeCache.has(str)) {
				typeCache.set(str, json.types.length);
				json.types.push(blockData);
			}

			json.blocks.push({
				position,
				type: typeCache.get(str),
			});
		}

		return json;
	}

	/**
	 * imports chunk from json
	 * @param  {VoxelChunkJSON} json
	 * @return {VoxelChunk} this
	 */
	fromJSON(json = {}) {
		let tmpVec = new THREE.Vector3();
		if (json.blocks && json.types) {
			json.blocks.forEach(([positionString, blockType]) => {
				let blockData = json.types[blockType];
				if (blockData) {
					let block = this.blockManager.createBlock(blockData.type);

					if (block) {
						block.fromJSON(blockData);
						this.setBlock(block, tmpVec.fromString(positionString));
					}
				}
			});
		}

		return this;
	}

	toString() {
		return "VoxelChunk(" + this.chunkPosition.toString() + ")";
	}

	/**
	 * @readOnly
	 * @type {Boolean}
	 */
	get empty() {
		return !this.blocks.size;
	}

	/**
	 * returns the position of this chunk (in chunk)
	 * @type {THREE.Vector3}
	 */
	get chunkPosition() {
		return this.map ? this.map.getChunkPosition(this) : new THREE.Vector3();
	}

	/**
	 * returns the position of the chunk in the map (in blocks)
	 * @readOnly
	 * @type {THREE.Vector3}
	 */
	get worldPosition() {
		return this.chunkPosition.clone().multiply(this.chunkSize);
	}

	/**
	 * returns the position of the chunk in the scene
	 * @return {THREE.Vector3}
	 */
	get scenePosition() {
		return this.chunkPosition
			.clone()
			.multiply(this.chunkSize)
			.multiply(this.blockSize);
	}

	/**
	 * returns the blockSize of the map
	 * @return {THREE.Vector3}
	 * @readOnly
	 */
	get blockSize() {
		return this.map ? this.map.blockSize : new THREE.Vector3();
	}

	/**
	 * returns the chunkSize of the map
	 * @return {THREE.Vector3}
	 * @readOnly
	 */
	get chunkSize() {
		return this.map ? this.map.chunkSize : new THREE.Vector3();
	}

	/**
	 * returns the block manager for this chunks map
	 * @return {VoxelBlockManager}
	 */
	get blockManager() {
		return this.map ? this.map.blockManager : undefined;
	}

	get useNeighborCache() {
		return !!this.map && this.map.useNeighborCache;
	}
}

// pools used when building chunks

/**
 * @type {Map}
 * @memberOf VoxelChunk
 */
VoxelChunk.materialOffsetCache = new Map();

/**
 * a cache for block neighbors used when building a chunk
 * @type {Map}
 * @memberOf VoxelChunk
 */
VoxelChunk.BuildBlockNeighborCache = new Map();

/**
 * @type {THREE.Vector3[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.VertexPool = [];

/**
 * @type {THREE.Face3[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.FacePool = [];

/**
 * @type {THREE.Vector2[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.UVPool = [];

/**
 * a cache for block neighbors
 * @type {WeakMap}
 * @memberOf VoxelChunk
 */
VoxelChunk.BlockNeighborCache = new WeakMap();
