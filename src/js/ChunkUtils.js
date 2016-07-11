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
	let pos = new THREE.Vector3().copy(fromV);
	let dist = toV.clone().sub(fromV);
	let i = Math.abs(dist.x*dist.y*dist.z);
	function setBlock(pos){
		let b = block instanceof Function? block(pos) : block;
		if(block == null || block == undefined)
			chunk.removeBlock(pos);
		else
			chunk.setBlock(block, pos);
	}
	while(i-- > 0){
		switch(type){
			case 'frame':
				if(
					(pos.x == fromV.x || pos.x == toV.x + Math.sign(fromV.x - toV.x)) +
					(pos.y == fromV.y || pos.y == toV.y + Math.sign(fromV.y - toV.y)) +
					(pos.z == fromV.z || pos.z == toV.z + Math.sign(fromV.z - toV.z)) >= 2
				){
					setBlock(pos);
				}
				break;
			case 'hollow':
				if(
					(pos.x == fromV.x || pos.x == toV.x + Math.sign(fromV.x - toV.x)) ||
					(pos.y == fromV.y || pos.y == toV.y + Math.sign(fromV.y - toV.y)) ||
					(pos.z == fromV.z || pos.z == toV.z + Math.sign(fromV.z - toV.z))
				){
					setBlock(pos);
				}
				break;
			default:
			case 'solid':
				setBlock(pos);
				break;
		}

		//increase position
		pos.x += Math.sign(toV.x - fromV.x);
		if(pos.x >= toV.x){
			pos.x = fromV.x; //reset X
			pos.y += Math.sign(toV.y - fromV.y);
			if(pos.y >= toV.y){
				pos.y = fromV.y; //reset Y
				pos.z += Math.sign(toV.z - fromV.z);
				if(pos.z >= toV.z){
					pos.copy(fromV); //reset all
					return; //done
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
