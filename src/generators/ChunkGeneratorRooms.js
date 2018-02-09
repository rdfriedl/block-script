import THREE from "three";
import ChunkGenerator from "./ChunkGenerator.js";
import * as ChunkUtils from "../ChunkUtils.js";

/** a chunk generator for making flat land */
export default class ChunkGeneratorRooms extends ChunkGenerator {
	setUpChunk(chunk) {
		// make walls
		ChunkUtils.drawCube(
			chunk,
			new THREE.Vector3(0, 0, 0),
			chunk.chunkSize,
			"stone",
			"hollow",
		);

		// make doors
		ChunkUtils.drawCube(
			chunk,
			new THREE.Vector3(chunk.chunkSize.x / 2 - 1, 1, 0),
			new THREE.Vector3(chunk.chunkSize.x / 2 + 1, 3, chunk.chunkSize.z),
			null,
		);
		ChunkUtils.drawCube(
			chunk,
			new THREE.Vector3(0, 1, chunk.chunkSize.z / 2 - 1),
			new THREE.Vector3(chunk.chunkSize.x, 3, chunk.chunkSize.z / 2 + 1),
			null,
		);
		ChunkUtils.drawCube(
			chunk,
			new THREE.Vector3(1, 0, 1),
			new THREE.Vector3(2, chunk.chunkSize.y, 2),
			null,
		);

		return chunk;
	}
}
