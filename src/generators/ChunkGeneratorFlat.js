import * as THREE from "three";
import ChunkGenerator from "./ChunkGenerator.js";
import * as ChunkUtils from "../ChunkUtils.js";

/** a chunk generator for making flat land */
export default class ChunkGeneratorFlat extends ChunkGenerator {
	setUpChunk(chunk) {
		if (chunk.chunkPosition.y === 0) {
			ChunkUtils.drawCube(
				chunk,
				new THREE.Vector3(0, 0, 0),
				new THREE.Vector3(1, 0, 1).multiply(chunk.map.chunkSize).setY(1),
				"top_dirt",
			);
		} else if (chunk.chunkPosition.y < -1) {
			ChunkUtils.drawCube(chunk, new THREE.Vector3(0, 0, 0), chunk.map.chunkSize, "stone");
		} else if (chunk.chunkPosition.y < 0) {
			ChunkUtils.drawCube(
				chunk,
				new THREE.Vector3(0, 0, 0).setY(Math.floor(chunk.map.chunkSize.y / 2)),
				chunk.map.chunkSize,
				"dirt",
			);

			ChunkUtils.drawCube(
				chunk,
				new THREE.Vector3(0, 0, 0),
				chunk.map.chunkSize.clone().setY(Math.ceil(chunk.map.chunkSize.y / 2)),
				"stone",
			);
		}
		return chunk;
	}
}
