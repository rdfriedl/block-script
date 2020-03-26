import { Vector3 } from "three";

import { fromJSON as VoxelBlockFromJSON } from "./VoxelBlock";
import VoxelChunk from "../VoxelChunk";
import VoxelBlockManager from "../VoxelBlockManager";

const tmpVec = new Vector3();

/**
 * @typedef {Object} VoxelChunkJSON
 * @property {Array<Number[]|Number>} blocks - an array of arrays of the position and block type of the block
 * @property {VoxelBlockJSON[]} types - an array of block types
 */

/**
 * returns a VoxelChunk in json form
 * @param {VoxelChunk} chunk
 * @return {VoxelChunkJSON}
 */
export function toJSON(chunk) {
	let json = {
		types: [],
		blocks: [],
	};

	// build list of block types
	let typeCache = new Map();

	for (let { position, block } of chunk.blocks) {
		let blockData = block.toJSON();
		let str = JSON.stringify(blockData);

		if (!typeCache.has(str)) {
			typeCache.set(str, json.types.length);
			json.types.push(blockData);
		}

		json.blocks.push([tmpVec.fromString(position).toArray(), typeCache.get(str)]);
	}

	return json;
}

/**
 * creates a VoxelChunk from json
 * @param {VoxelChunkJSON} json
 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst] - the block manager used when creating the blocks
 * @return {VoxelChunk}
 */
export function fromJSON(json, blockManager = VoxelBlockManager.inst) {
	let chunk = new VoxelChunk();

	json.blocks.forEach(([positionArray, blockType]) => {
		let blockData = json.types[blockType];
		if (blockData) {
			let block = VoxelBlockFromJSON(blockData, blockManager);

			if (block) {
				chunk.setBlock(block, tmpVec.fromArray(positionArray));
			}
		}
	});

	return chunk;
}
