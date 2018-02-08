import THREE from "three";

const NEIGHBORS_DIRS = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
	[-1, 0, 0],
	[0, -1, 0],
	[0, 0, -1],
];

/**
 * @name VoxelChunk
 * @class
 * @extends {THREE.Group}
 * @param   {Object} [data] - an optional json object to pass to {@link VoxelChunk#fromJSON}
 */
export default class VoxelChunk extends THREE.Group {
	constructor(data) {
		super();

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
		 * @private
		 * @var {THREE.Mesh}
		 */
		this.mesh;

		/**
		 * this is read by the parent map, and if its true it will trigger {@link VoxelChunk#build}
		 * @private
		 * @var {Boolean}
		 */
		this.needsBuild = false;

		/**
		 * a THREE.MultiMaterial thats made up of all the blocks materials
		 * @var {THREE.MultiMaterial}
		 * @private
		 */
		this.material = new THREE.MultiMaterial();

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @var {THREE.Vector3}
		 * @private
		 */
		this.tmpVec = new THREE.Vector3();
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
	 * @return {this}
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
					if (this.useNeighborCache)
						VoxelChunk.BlockNeighborCache.set(block, neighbors);
				}

				VoxelChunk.BuildBlockNeighborCache.set(block, neighbors);

				for (let i in neighbors) {
					if (
						neighbors[i] === undefined ||
						neighbors[i].properties.transparent == true
					)
						return true;
				}
				return false;
			});

		this.material.materials = [];
		this.material.needsUpdate = true;

		// merge the geometries
		let blockPositionOffset = new THREE.Vector3(0.5, 0.5, 0.5);
		let matrix = new THREE.Matrix4();
		blocks.forEach(block => {
			matrix.identity();

			// add the material
			let materialOffset = VoxelChunk.materialOffsetCache.get(block.material);
			if (materialOffset == undefined) {
				materialOffset = this.material.materials.length;
				if (block.material instanceof THREE.MultiMaterial) {
					for (let i in block.material.materials) {
						this.material.materials.push(block.material.materials[i]);
					}
				} else if (block.material instanceof THREE.Material)
					this.material.materials.push(block.material);
				VoxelChunk.materialOffsetCache.set(block.material, materialOffset);
			}

			// set rotation
			if (block.properties.rotation instanceof THREE.Euler)
				matrix.makeRotationFromEuler(block.properties.rotation);

			// set position
			matrix.setPosition(
				this.tmpVec.copy(block.position).add(blockPositionOffset),
			);

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
						for (
							let i = 0;
							i < block.geometry.faceVertexUvs[0][faceIndex].length;
							i++
						) {
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
			this.mesh = new THREE.Mesh(geometry, this.material);
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
	 * @return {this}
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
	hasBlock(pos) {
		if (pos instanceof THREE.Vector3) {
			pos = this.tmpVec.copy(pos).round();
			return this.blocks.has(pos.toString());
		} else if (pos instanceof VoxelBlock) {
			for (let block of this.blocks) {
				if (block[1] === pos) return true;
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
	getBlock(pos) {
		if (pos instanceof THREE.Vector3) {
			pos = this.tmpVec.copy(pos).round();
			return this.blocks.get(pos.toString());
		} else if (pos instanceof VoxelBlock) {
			if (this.hasBlock(pos)) return pos;
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
	 * @returns {VoxelBlock}
	 */
	createBlock(id, pos) {
		let block;
		if (String.isString(id))
			block = this.map && this.map.blockManager.createBlock(id);

		if (block && pos) {
			this.setBlock(block, pos);
		}
		return block;
	}

	/**
	 * adds a block to the chunk at position.
	 * if "block" is a String it will create a new block with using the parents maps {@link VoxelBlockManager#createBlock}
	 * @param {VoxelBlock|String} block
	 * @param {(THREE.Vector3)} position
	 * @returns {this}
	 *
	 * @fires VoxelChunk#block:set
	 */
	setBlock(block, pos) {
		if (block instanceof VoxelBlock && block.parent)
			throw new Error("cant add block that already has a parent");

		if (String.isString(block))
			block = this.map && this.map.blockManager.createBlock(block);

		if (pos instanceof THREE.Vector3 && block instanceof VoxelBlock) {
			pos = this.tmpVec.copy(pos).round();

			// dont place the block outside of the chunk
			let chunkSize = this.chunkSize;
			if (
				pos.x < 0 ||
				pos.y < 0 ||
				pos.z < 0 ||
				pos.x >= chunkSize.x ||
				pos.y >= chunkSize.y ||
				pos.z >= chunkSize.z
			)
				return this;

			let str = pos.toString();
			let oldBlock = this.blocks.get(str);

			// add it to this chunk
			this.blocks.set(str, block);
			this.blocksPositions.set(block, pos.clone()); // clone the pos so we are not storing the original vec

			block.parent = this;

			// remove this blocks neighbors from the cache
			if (this.useNeighborCache)
				VoxelChunk.removeBlockFromNeighborCache(block, true);

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
	 * @return {this}
	 *
	 * @fires VoxelChunk#blocks:cleared
	 */
	clearBlocks(disposeBlocks = true) {
		let blocks = this.listBlocks();
		blocks.forEach(b => {
			b.parent = undefined;

			if (this.useNeighborCache)
				VoxelChunk.removeBlockFromNeighborCache(b, false);
		});
		this.blocks.clear();
		this.needsBuild = true;

		// add blocks to pool
		// NOTE: we have to call this AFTER we remove the block from this chunk, otherwise we get an inifite loop because the blockManager tries to remove the block
		if (disposeBlocks && this.map)
			blocks.forEach(block => this.map.blockManager.disposeBlock(block));

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
	 * @return {this}
	 *
	 * @fires VoxelChunk#block:removed
	 */
	removeBlock(pos, disposeBlock = true) {
		if (this.hasBlock(pos)) {
			let block;
			if (pos instanceof THREE.Vector3) {
				block = this.getBlock(pos);
			} else if (pos instanceof VoxelBlock) {
				block = pos;
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
	 * @param  {VoxelBlock} block
	 * @param  {Boolean} setBuild - whether to set the build flag on the parent chunk
	 * @static
	 */
	static removeBlockFromNeighborCache(
		block,
		removeNeighbors = true,
		setBuild = false,
	) {
		if (block.map) {
			let neighbors = VoxelChunk.BlockNeighborCache.get(block);
			VoxelChunk.BlockNeighborCache.delete(block);

			if (removeNeighbors) {
				if (neighbors) {
					for (let i in neighbors) {
						VoxelChunk.BlockNeighborCache.delete(neighbors[i]);
						if (setBuild && neighbors[i] && neighbors[i].chunk)
							neighbors[i].chunk.needsBuild = true;
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
	getNeighbor(dir) {
		if (this.map && dir instanceof THREE.Vector3) {
			return this.map.getChunk(this.chunkPosition.clone().add(dir));
		}
	}

	/**
	 * exports chunk to json format
	 * @return {Object}
	 * @property {Array} blocks an array of Objects from {@link VoxelBlock.toJSON}
	 */
	toJSON() {
		let json = {};

		// build list of block types
		let typeCache = new Map();
		json.blockTypes = [];

		json.blocks = Array.from(this.blocks).map(block => {
			let blockData = block[1].toJSON();
			let str = JSON.stringify(blockData);
			if (!typeCache.has(str)) {
				typeCache.set(str, json.blockTypes.length);
				json.blockTypes.push(blockData);
			}
			let data = block[0].split(",").map(v => parseInt(v));
			data.push(typeCache.get(str));
			return data; // [x,y,z,typeID]
		});
		return json;
	}

	/**
	 * imports chunk from json
	 * @param  {Object} json
	 * @param  {Object[]} json.blocks an array of objects to pass to {@link VoxelBlock.fromJSON}
	 * @return {this}
	 */
	fromJSON(json) {
		let tmpVec = new THREE.Vector3();
		if (json.blocks && json.blockTypes) {
			json.blocks.forEach(data => {
				// data is in format [x,y,z,typeID]
				let blockData = json.blockTypes[data[3]];
				if (blockData) {
					let block = this.blockManager.createBlock(blockData.type);

					if (block) {
						block.fromJSON(blockData);
						this.setBlock(block, tmpVec.set(data[0], data[1], data[2]));
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
	 * @return {THRE.Vector3}
	 */
	get chunkPosition() {
		return this.map ? this.map.getChunkPosition(this) : new THREE.Vector3();
	}

	/**
	 * returns the position of the chunk in the map (in blocks)
	 * @readOnly
	 * @var {THREE.Vector3}
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
	 * @return {ThREE.Vector3}
	 * @readOnly
	 */
	get blockSize() {
		return this.map ? this.map.blockSize : new THREE.Vector3();
	}

	/**
	 * returns the chunkSize of the map
	 * @return {ThREE.Vector3}
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

// import block for runtime
import VoxelBlock from "./VoxelBlock.js";
