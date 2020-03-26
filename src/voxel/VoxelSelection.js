import { Group, Vector3, Box3 } from "three";
import "../three-changes";

import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";

/** a selection of blocks */
export default class VoxelSelection extends Group {
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
		 * a WeakMap of
		 * Vector3 with the keys being the blocks
		 * @type {WeakMap}
		 */
		this.blocksPositions = new WeakMap();

		/**
		 * the size of the blocks in this selection.
		 * this is used when building this selection to a mesh
		 * @type {Vector3}
		 * @default [32,32,32]
		 */
		this.blockSize = new Vector3(32, 32, 32);

		/**
		 * a tmp Vector3 the chunk uses so it dose not have to create new instances
		 * @type {Vector3}
		 */
		this.tmpVec = new Vector3();
	}

	name = "VoxelSelection";

	/**
	 * checks to see if there is a block at position, or if the block is in this selection
	 * @param  {Vector3|VoxelBlock} position - the position to check, or the block to check for
	 * @return {Boolean}
	 */
	hasBlock(position) {
		if (position instanceof Vector3) {
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
	 * @param  {
	 * Vector3|VoxelBlock} position
	 * @return {VoxelBlock}
	 */
	getBlock(position) {
		if (position instanceof VoxelBlock) {
			return this.hasBlock(position) ? position : undefined;
		}

		return this.blocks.get(this.tmpVec.copy(position).round().toString());
	}

	/**
	 * returns the position of the block in this chunk
	 * @param  {VoxelBlock} block
	 * @return {Vector3}
	 */
	getBlockPosition(block) {
		return this.blocksPositions.get(block) || new Vector3();
	}

	/**
	 * calls setBlock and returns the newly created VoxelBlock
	 * @param  {String} id - the UID of the block to create
	 * @param  {Vector3} position - the position to add the block to
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
	 * @param {Vector3} position
	 * @return {this}
	 *
	 * @emits {block:set}
	 */
	setBlock(block, position) {
		if (block instanceof VoxelBlock && block.parent) {
			throw new Error("cant add block that already has a parent");
		}

		if (typeof block === "string") {
			block = this.blockManager.createBlock(block);
		}

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
			oldBlock: oldBlock,
		});

		return this;
	}

	/**
	 * removes all blocks from this selection
	 * @param {Boolean} [disposeBlocks=true]
	 * @return {VoxelSelection} this
	 *
	 * @emits {blocks:cleared}
	 */
	clearBlocks(disposeBlocks = true) {
		let blocks = this.listBlocks();
		blocks.forEach((block) => {
			block.parent = undefined;
		});
		this.blocks.clear();

		// dispose of the blocks
		// NOTE: we have to call this AFTER we remove the block from this selection, otherwise we get an infinite loop because the blockManager tries to remove the block
		if (disposeBlocks) {
			blocks.forEach((block) => this.blockManager.disposeBlock(block));
		}

		// fire event
		this.dispatchEvent({
			type: "blocks:cleared",
		});

		return this;
	}

	/**
	 * @param  {
	 * Vector3|VoxelBlock} position - the position of the block to remove, or the VoxelBlock to remove
	 * @param {Boolean} [disposeBlock=true]
	 * @return {VoxelSelection} this
	 *
	 * @emits {block:removed}
	 */
	removeBlock(position, disposeBlock = true) {
		if (!this.hasBlock(position)) return this;

		let block = this.getBlock(position);
		if (!block) return this;

		// remove it from the maps
		this.blocks.delete(block.position.toString());
		this.blocksPositions.delete(block);

		block.parent = undefined;

		// dispose of the block
		// NOTE: we have to call this AFTER we remove the block from this chunk, otherwise we get an infinite loop because the blockManager tries to remove the block
		if (disposeBlock) {
			this.blockManager.disposeBlock(block);
		}

		this.dispatchEvent({
			type: "block:removed",
			block: block,
		});

		return this;
	}

	/**
	 * returns an Array of all the blocks in this selection
	 * @return {VoxelBlock[]}
	 */
	listBlocks() {
		return Array.from(this.blocks).map((d) => d[1]);
	}

	/** @return {Boolean} */
	get empty() {
		return !this.blocks.size;
	}

	/**
	 * returns the size of the selection
	 * @return {Vector3} the size in blocks of this selection
	 */
	get size() {
		if (this.blocks.size) {
			let min = new Vector3().addScalar(Infinity),
				max = new Vector3().addScalar(-Infinity);
			this.blocks.forEach((block) => {
				let pos = this.getBlockPosition(block);
				min.min(pos);
				max.max(pos);
			});
			return max.sub(min).add(this.tmpVec.set(1, 1, 1));
		} else {
			return new Vector3();
		}
	}

	/**
	 * returns the bounding box of the selection
	 * @return {Box3}
	 */
	get boundingBox() {
		let box = new Box3();
		let tmp = new Vector3();

		if (this.blocks.size) {
			this.blocks.forEach((block) => {
				let pos = this.getBlockPosition(block);
				box.min.min(pos);
				box.max.max(pos);
			});

			if (Number.isFinite(box.getSize(tmp).length())) {
				return box;
			}
		}

		return new Box3(new Vector3(), new Vector3());
	}
}
