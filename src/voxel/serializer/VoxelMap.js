import { fromJSON as VoxelChunkFromJSON, toJSON as VoxelChunkToJSON } from "./VoxelChunk";
import VoxelMap from "../VoxelMap";
import VoxelBlockManager from "../VoxelBlockManager";
import * as THREE from "three";

/**
 * @typedef {Object} VoxelMapJSON
 * @property {Array<THREE.Vector3|VoxelChunkJSON[]>} chunks - an array of arrays, with the chunks position followed by its json
 */

/**
 * exports a VoxelMap to json form
 * @param {VoxelMap} map
 * @return {VoxelMapJSON}
 */
export function toJSON(map) {
	return {
		chunks: map.listChunks().forEach(chunk => [chunk.chunkPosition.toArray(), VoxelChunkToJSON(chunk)])
	};
}

/**
 * creates a VoxelMap from json
 * @param {VoxelMapJSON} json
 * @param {VoxelBlockManager} [blockManager=VoxelBlockManager.inst] - the block manager used when creating the blocks
 * @return {VoxelMap}
 */
export function fromJSON(json, blockManager = VoxelBlockManager.inst) {
	let map = new VoxelMap(blockManager);

	json.chunks.forEach(([positionArray, chunkData]) => {
		let position = new THREE.Vector3().fromArray(positionArray);
		let chunk = VoxelChunkFromJSON(chunkData, blockManager);

		map.setChunk(chunk, position);
	});

	return map;
}
