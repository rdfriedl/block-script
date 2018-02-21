import { Vector3, Face3, Vector2, Geometry, Matrix4, Material, Euler, BoxGeometry, Mesh } from "three";
import "../three-changes";
import VoxelBlock from "./VoxelBlock.js";
import VoxelSelection from "./VoxelSelection";

/** the directions of neighbors */
const NEIGHBORS_DIRS = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

/** an extension of the VoxelSelection class to make a chunk */
export default class VoxelChunk extends VoxelSelection {
	constructor() {
		super();

		/**
		 * @private
		 * @type {Mesh}
		 */
		this.mesh = undefined;

		/**
		 * the parent VoxelMap
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
		 * @type {Material[]}
		 * @private
		 */
		this.materials = [];

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @type {Vector3}
		 * @private
		 */
		this.tmpVec = new Vector3();
	}

	/**
	 * updates the geometry and material for this chunk, based on the blocks
	 * @return {VoxelChunk} this
	 *
	 * @emits {built}
	 */
	build() {
		this.disposeGeometry();

		let geometry = new Geometry();

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
		let blockPositionOffset = new Vector3(0.5, 0.5, 0.5);
		let matrix = new Matrix4();
		blocks.forEach(block => {
			matrix.identity();

			// add the material
			let materialOffset = VoxelChunk.materialOffsetCache.get(block.material);
			if (materialOffset == undefined) {
				materialOffset = this.materials.length;
				if (Array.isArray(block.material)) {
					this.materials.push(...block.material);
				} else if (block.material instanceof Material) {
					this.materials.push(block.material);
				}
				VoxelChunk.materialOffsetCache.set(block.material, materialOffset);
			}

			// set rotation
			if (block.properties.rotation instanceof Euler) matrix.makeRotationFromEuler(block.properties.rotation);

			// set position
			matrix.setPosition(this.tmpVec.copy(block.position).add(blockPositionOffset));

			// merge the geometry
			if (block.geometry instanceof BoxGeometry) {
				// its just a box, loop though the faces and only add some of them
				let neighbors = VoxelChunk.BuildBlockNeighborCache.get(block);

				// merge the vertices
				let verticesOffset = geometry.vertices.length;
				for (let i in block.geometry.vertices) {
					let point = VoxelChunk.VertexPool.pop() || new Vector3();
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
						let newFace = VoxelChunk.FacePool.pop() || new Face3();
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
							let uv = VoxelChunk.UVPool.pop() || new Vector2();
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
				if (block.material instanceof MultiMaterial) {
					geometry.merge(block.geometry, matrix, materialOffset);
				} else if (block.material instanceof Material) {
					geometry.merge(block.geometry, matrix, materialOffset);
				}
			}
		});
		VoxelChunk.materialOffsetCache.clear();
		VoxelChunk.BuildBlockNeighborCache.clear();

		geometry.mergeVertices();
		geometry.computeFaceNormals();

		if (!this.mesh) {
			this.mesh = new Mesh(geometry, this.materials);
			this.mesh.scale.multiply(this.blockSize);
			this.add(this.mesh);
		} else {
			this.mesh.geometry = geometry;
			this.mesh.geometry.needsUpdate = true;
		}

		this.needsBuild = false;

		// fire event
		this.dispatchEvent({
			type: "built"
		});

		// fire event on parent
		if (this.map && this.map.dispatchEvent)
			this.map.dispatchEvent({
				type: "chunk:built",
				chunk: this
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

		return this;
	}

	/**
	 * adds a block to the chunk at position.
	 * if "block" is a String it will create a new block with using the parents maps {@link VoxelBlockManager#createBlock}
	 * @param {VoxelBlock|String} block
	 * @param {Vector3} position
	 * @return {this}
	 *
	 * @emits {block:set}
	 */
	setBlock(block, position) {
		position = this.tmpVec.copy(position).round();

		let oldBlock = this.getBlock(position);

		// don't place the block outside of the chunk
		let chunkSize = this.chunkSize;
		if (
			position.x < 0 ||
			position.y < 0 ||
			position.z < 0 ||
			position.x >= chunkSize.x ||
			position.y >= chunkSize.y ||
			position.z >= chunkSize.z
		) {
			return this;
		}

		// remove this blocks neighbors from the cache
		if (this.useNeighborCache) {
			VoxelChunk.removeBlockFromNeighborCache(block, true);
		}

		super.setBlock(block, position);

		// fire event on parent
		if (this.map) {
			this.map.dispatchEvent({
				type: "block:set",
				chunk: this,
				block: block,
				oldBlock: oldBlock
			});
		}

		// tell the map that we need to rebuild this chunk
		this.needsBuild = true;

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

		if (this.useNeighborCache) {
			blocks.forEach(b => {
				VoxelChunk.removeBlockFromNeighborCache(b, false);
			});
		}

		super.clearBlocks();

		// fire event on parent
		if (this.map) {
			this.map.dispatchEvent({
				type: "chunk:blocks:cleared",
				chunk: this
			});
		}

		this.needsBuild = true;

		return this;
	}

	/**
	 * @param  {Vector3|VoxelBlock} position - the position of the block to remove, or the {@link VoxelBlock} to remove
	 * @param {Boolean} [disposeBlock=true]
	 * @return {VoxelChunk} this
	 *
	 * @fires VoxelChunk#block:removed
	 */
	removeBlock(position, disposeBlock = true) {
		if (!this.hasBlock(position)) return this;

		let block = this.getBlock(position);
		if (!block) return this;

		// remove it from the cache, and update its neighbors
		VoxelChunk.removeBlockFromNeighborCache(block, true);

		super.removeBlock(position, disposeBlock);

		// tell the map that we need to rebuild this chunk
		this.needsBuild = true;

		// fire event on parent
		if (this.map && this.map.dispatchEvent) {
			this.map.dispatchEvent({
				type: "block:removed",
				chunk: this,
				block: block
			});
		}

		return this;
	}

	/**
	 * removes a block and its neighbors from the {@link VoxelChunk.BlockNeighborCache}
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
	 * @param  {Vector3} direction - the direction to check
	 * @return {VoxelChunk}
	 */
	getNeighbor(direction) {
		if (this.map && direction instanceof Vector3) {
			return this.map.getChunk(this.chunkPosition.clone().add(direction));
		}
	}

	toString() {
		return "VoxelChunk(" + this.chunkPosition.toString() + ")";
	}

	/**
	 * returns the position of this chunk (in chunk)
	 * @type {Vector3}
	 */
	get chunkPosition() {
		return this.map ? this.map.getChunkPosition(this) : new Vector3();
	}

	/**
	 * returns the position of the chunk in the map (in blocks)
	 * @readOnly
	 * @type {Vector3}
	 */
	get worldPosition() {
		return this.chunkPosition.clone().multiply(this.chunkSize);
	}

	/**
	 * returns the position of the chunk in the scene
	 * @return {Vector3}
	 */
	get scenePosition() {
		return this.chunkPosition
			.clone()
			.multiply(this.chunkSize)
			.multiply(this.blockSize);
	}

	/** @return {Vector3} */
	get blockSize() {
		return this.map ? this.map.blockSize : new Vector3();
	}
	/** @param {Vector3} size*/
	set blockSize(size) {}

	/**
	 * returns the chunkSize of the map
	 * @return {Vector3}
	 * @readOnly
	 */
	get chunkSize() {
		return this.map ? this.map.chunkSize : new Vector3();
	}

	/**
	 * returns the block manager for this chunks map
	 * @type {VoxelBlockManager}
	 */
	get blockManager() {
		return this.map ? this.map.blockManager : undefined;
	}
	/** @param {VoxelBlockManager} blockManager*/
	set blockManager(blockManager) {}

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
 * @type {Vector3[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.VertexPool = [];

/**
 * @type {Face3[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.FacePool = [];

/**
 * @type {Vector2[]}
 * @memberOf VoxelChunk
 */
VoxelChunk.UVPool = [];

/**
 * a cache for block neighbors
 * @type {WeakMap}
 * @memberOf VoxelChunk
 */
VoxelChunk.BlockNeighborCache = new WeakMap();
