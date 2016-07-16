import THREE from 'three';

/**
 * @module ChunkUtils
 */

/**
 * draws a line in blocks
 * @param  {VoxelChunk|VoxelMap} chunk the chunk or map to use
 * @param  {THREE.Vector3} from the start position
 * @param  {THREE.Vector3} to the end position
 * @param  {String|Function} block the block to use. if a function is passed it will be called with
 * @param  {THREE.Vector3} block.pos the position of the block
 */
export function drawLine(chunk, fromV, toV, block){
	let dv = new THREE.Vector3().add(toV).sub(fromV);
	let sv = new THREE.Vector3(fromV.x < toV.x? 1 : -1, fromV.y < toV.y? 1 : -1, fromV.z < toV.z? 1 : -1);
	let err = 0;
}

/**
 * draws a cube in blocks
 * @param  {VoxelChunk|VoxelMap} chunk the chunk or map to use
 * @param  {THREE.Vector3} from the start position
 * @param  {THREE.Vector3} to the end position
 * @param  {String|Function|Null} block the block to use. if a function is passed it will be called with
 * @param  {THREE.Vector3} block.pos the position of the block
 * @param  {String} [type='solid'] the type of cube ('solide', 'hollow', 'frame')
 */
export function drawCube(chunk, fromV, toV, block, type = 'solid'){
	let pos = new THREE.Vector3();
	let min = new THREE.Vector3(Infinity,Infinity,Infinity).min(fromV).min(toV);
	let max = new THREE.Vector3(-Infinity,-Infinity,-Infinity).max(fromV).max(toV);

	if(!Number.isFinite(min.length()) || !Number.isFinite(max.length()))
		return;

	function setBlock(pos){
		let b = block instanceof Function? block(pos) : block;
		if(b == null || b == undefined)
			chunk.removeBlock(pos);
		else
			chunk.setBlock(b, pos);
	}

	for (let x = min.x; x < max.x; x++) {
		for (let y = min.y; y < max.y; y++) {
			for (let z = min.z; z < max.z; z++) {
				pos.set(x,y,z);

				switch(type){
					case 'frame':
						if(
							(pos.x == min.x || pos.x == toV.x -1) +
							(pos.y == min.y || pos.y == toV.y -1) +
							(pos.z == min.z || pos.z == toV.z -1) >= 2
						){
							setBlock(pos);
						}
						break;
					case 'hollow':
						if(
							(pos.x == min.x || pos.x == toV.x -1) ||
							(pos.y == min.y || pos.y == toV.y -1) ||
							(pos.z == min.z || pos.z == toV.z -1)
						){
							setBlock(pos);
						}
						break;
					default:
					case 'solid':
						setBlock(pos);
						break;
				}
			}
		}
	}
}

/**
 * draws a sphere in blocks
 * @param  {VoxelChunk|VoxelMap} chunk - the chunk or map to use
 * @param  {THREE.Vector3} center - the center of the sphere
 * @param  {THREE.Vector3} radius - the radius of the sphere
 * @param  {String|Function} block - the block to use. if a function is passed it will be called with
 * @param  {THREE.Vector3} block.pos the position of the block
 * @param  {String} [type='solid'] the type of sphere ('solide', 'hollow')
 */
export function drawSphere(chunk, center, radius, block, type = 'solid'){

}
