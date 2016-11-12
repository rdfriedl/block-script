import THREE from 'three';
import VoxelChunk from '../voxel/VoxelChunk.js';
import VoxelBlock from '../voxel/VoxelBlock.js';

/**
 * @class
 * @name ChunkGenerator
 * @param {VoxelMap} map the map this generator will use
 */
export default class ChunkGenerator{
	/**
	 * sets up a chunk
	 * @param  {VoxelChunk} chunk
	 * @return {VoxelChunk} returns chunk
	 */
	setUpChunk(chunk){
		return chunk;
	}
}
