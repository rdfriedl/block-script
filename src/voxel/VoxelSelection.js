import * as THREE from "three";
import "../three-changes";

/** a selection of blocks */
export default class VoxelSelection extends THREE.EventDispatcher {
	constructor(blockManager = VoxelBlockManager.inst) {
		super();
		/**
		 * the block manager this selection will use
		 * @default {@link VoxelBlockManager.inst}
		 * @type {VoxelBlockManager}
		 */
		this.blockManager = blockManager;

		/**
		 * a Map of VoxelBlock with the keys being a string "x,y,z"
		 * @type {Map}
		 */
		this.blocks = new Map();

		/**
		 * a WeakMap of THREE.Vector3 with the keys being the blocks
		 * @private
		 * @type {WeakMap}
		 */
		this.blocksPositions = new WeakMap();

		/**
		 * the size of the blocks in this selection.
		 * this is used when building this selection to a mesh
		 * @type {THREE.Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new THREE.Vector3(32, 32, 32);

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @type {THREE.Vector3}
		 * @private
		 */
		this.tmpVec = new THREE.Vector3();
	}

	/**
	 * fired when a block is set
	 * @event VoxelSelection#block:set
	 * @type {Object}
	 * @property {VoxelSelection} target
	 * @property {VoxelBlock} block
	 * @property {VoxelBlock} oldBlock
	 */
	/**
	 * fired when a block is removed
	 * @event VoxelSelection#block:removed
	 * @type {Object}
	 * @property {VoxelSelection} target
	 * @property {VoxelBlock} block - the block that was removed
	 */
	/**
	 * @event VoxelSelection#blocks:cleared
	 * @type {Object}
	 * @property {VoxelSelection} target
	 */

	/**
	 * checks to see if we have a block at position, or if the block is in this selection
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
	 * returns the block at position
	 * @param  {THREE.Vector3} position
	 * @return {VoxelBlock}
	 */
	getBlock(position) {
		return this.blocks.get(
			this.tmpVec
				.copy(position)
				.round()
				.toString()
		);
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
	 * calls setBlock and returns the newly created VoxelBlock
	 * @param  {String} id - the UID of the block to create
	 * @param  {THREE.Vector3} position - the position to add the block to
	 * @return {VoxelBlock}
	 */
	createBlock(id, position) {
		this.setBlock(id, position);

		return this.getBlock(position);
	}

	/**
	 * adds a block to the chunk at position
	 * if "block" is a String it will create a new block with using {@link VoxelBlockManager#createBlock}
	 * @param {VoxelBlock|String} block
	 * @param {THREE.Vector3} position
	 * @return {this}
	 *
	 * @emits {block:set}
	 */
	setBlock(block, position) {
		if (block instanceof VoxelBlock && block.parent) throw new Error("cant add block that already has a parent");

		if (typeof block === "string") {
			block = this.blockManager.createBlock(block);
		}

		if (position instanceof THREE.Vector3 && block instanceof VoxelBlock) {
			position = this.tmpVec.copy(position).round();
			let str = position.toString();
			let oldBlock = this.blocks.get(str);

			this.blocks.set(str, block);
			this.blocksPositions.set(block, position.clone());

			block.parent = this;

			// fire event
			this.dispatchEvent({
				type: "block:set",
				block: block,
				oldBlock: oldBlock
			});
		}

		return this;
	}

	/**
	 * removes all blocks from this selection
	 * @return {this}
	 *
	 * @emits {blocks:cleared}
	 */
	clearBlocks() {
		this.listBlocks().forEach(b => {
			b.parent = undefined;
		});
		this.blocks.clear();

		// fire event
		this.dispatchEvent({
			type: "blocks:cleared"
		});

		return this;
	}

	/**
	 * @param  {THREE.Vector3|VoxelBlock} position - the position of the block to remove, or the VoxelBlock to remove
	 * @return {this}
	 *
	 * @fires VoxelSelection#block:removed
	 */
	removeBlock(position) {
		if (this.hasBlock(position)) {
			let block;
			if (position instanceof THREE.Vector3) {
				block = this.getBlock(position.clone().round());
			} else if (position instanceof VoxelBlock) {
				block = position;
			}
			if (!block) return this;

			// remove it from the maps
			this.blocks.delete(block.position.toString());
			this.blocksPositions.delete(block);

			block.parent = undefined;

			this.dispatchEvent({
				type: "block:removed",
				block: block
			});
		}

		return this;
	}

	/**
	 * returns an Array of all the blocks in this chunk
	 * @return {VoxelBlock[]}
	 */
	listBlocks() {
		return Array.from(this.blocks).map(d => d[1]);
	}

	/**
	 * @readOnly
	 * @type {Boolean}
	 */
	get empty() {
		return !this.blocks.size;
	}

	/**
	 * returns the size of the selection
	 * @return {THREE.Vector3} the size in blocks of this selection
	 * @readOnly
	 */
	get size() {
		if (this.blocks.size) {
			let min = new THREE.Vector3().addScalar(Infinity),
				max = new THREE.Vector3().addScalar(-Infinity);
			this.blocks.forEach(block => {
				let pos = this.getBlockPosition(block);
				min.min(pos);
				max.max(pos);
			});
			return max.sub(min).add(this.tmpVec.set(1, 1, 1));
		} else return new THREE.Vector3();
	}

	/**
	 * returns the bounding box of the selection
	 * @return {THREE.Box3}
	 * @readOnly
	 */
	get boundingBox() {
		let box = new THREE.Box3(
			new THREE.Vector3(Infinity, Infinity, Infinity),
			new THREE.Vector3(-Infinity, -Infinity, -Infinity)
		);
		if (this.blocks.size) {
			this.blocks.forEach(block => {
				let pos = this.getBlockPosition(block);
				box.min.min(pos);
				box.max.max(pos);
			});

			if (Number.isFinite(box.getSize().length())) return box;
		}

		return new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	}
}

// import block for runtime
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
