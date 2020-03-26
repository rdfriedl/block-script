import VoxelBlock from "../VoxelBlock";
import VoxelBlockManager from "../VoxelBlockManager";

/**
 * @typedef {Object} VoxelBlockJSON
 * @property {String} type - the id of the block
 * @property {Object} properties - the blocks properties
 */

/**
 * returns a VoxelBlock in json form
 * @param {VoxelBlock} block
 * @return {VoxelBlockJSON}
 */
export function toJSON(block) {
	return {
		type: block.id,
		properties: block.hasOwnProperty("properties") ? block.properties : undefined,
	};
}

/**
 * creates a VoxelBlock from json
 * @param {VoxelBlockJSON} json
 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst]
 * @return {VoxelBlock}
 */
export function fromJSON(json, blockManager = VoxelBlockManager.inst) {
	let block = blockManager.createBlock(json.type);

	if (json.properties) {
		block.setProp(json.properties);
	}

	return block;
}
