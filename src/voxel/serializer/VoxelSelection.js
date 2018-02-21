import * as THREE from "three";

import { fromJSON as VoxelBlockFromJSON } from "./VoxelBlock";
import VoxelSelection from "../VoxelSelection";
import VoxelBlockManager from "../VoxelBlockManager";

const tmpVec = new THREE.Vector3();

/**
 * @typedef {Object} VoxelSelectionJSON
 * @property {Array<Number[]|Number>} blocks - an array of arrays of the position and block type of the block
 * @property {VoxelBlockJSON[]} types - an array of block types
 */

/**
 * returns a VoxelSelection in json form
 * @param {VoxelSelection} selection
 * @return {VoxelSelectionJSON}
 */
export function toJSON(selection) {
	let json = {
		types: [],
		blocks: []
	};

	// build list of block types
	let typeCache = new Map();

	for (let { position, block } of selection.blocks) {
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
 * creates a VoxelSelection from json
 * @param {VoxelSelectionJSON} json
 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst] - the block manager used when creating the blocks
 * @return {VoxelSelection}
 */
export function fromJSON(json, blockManager = VoxelBlockManager.inst) {
	let selection = new VoxelSelection(blockManager);

	json.blocks.forEach(([positionArray, blockType]) => {
		let blockData = json.types[blockType];
		if (blockData) {
			let block = VoxelBlockFromJSON(blockData, blockManager);

			if (block) {
				selection.setBlock(block, tmpVec.fromArray(positionArray));
			}
		}
	});

	return selection;
}
