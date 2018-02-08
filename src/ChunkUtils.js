import THREE from "three";

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
export function drawLine(chunk, fromV, toV, block) {
	let dv = new THREE.Vector3().add(toV).sub(fromV);
	let sv = new THREE.Vector3(
		fromV.x < toV.x ? 1 : -1,
		fromV.y < toV.y ? 1 : -1,
		fromV.z < toV.z ? 1 : -1,
	);
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
export function drawCube(chunk, fromV, toV, block, type = "solid") {
	let pos = new THREE.Vector3();
	let min = new THREE.Vector3(Infinity, Infinity, Infinity).min(fromV).min(toV);
	let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
		.max(fromV)
		.max(toV);

	if (!Number.isFinite(min.length()) || !Number.isFinite(max.length())) return;

	function setBlock(pos) {
		let b = block instanceof Function ? block(pos) : block;
		if (b == null || b == undefined) chunk.removeBlock(pos);
		else chunk.setBlock(b, pos);
	}

	for (let x = min.x; x <= max.x; x++) {
		for (let y = min.y; y <= max.y; y++) {
			for (let z = min.z; z <= max.z; z++) {
				pos.set(x, y, z);

				switch (type) {
					case "frame":
						if (
							(pos.x == min.x || pos.x == max.x) +
								(pos.y == min.y || pos.y == max.y) +
								(pos.z == min.z || pos.z == max.z) >=
							2
						) {
							setBlock(pos);
						}
						break;
					case "hollow":
						if (
							pos.x == min.x ||
							pos.x == max.x ||
							(pos.y == min.y || pos.y == max.y) ||
							(pos.z == min.z || pos.z == max.z)
						) {
							setBlock(pos);
						}
						break;
					default:
					case "solid":
						setBlock(pos);
						break;
				}
			}
		}
	}
}

/**
 * removes all blocks in a cube
 * @param  {VoxelChunk|VoxelMap} chunk the chunk or map to use
 * @param  {THREE.Vector3} from the start position
 * @param  {THREE.Vector3} to the end position
 */
export function clearCube(chunk, fromV, toV) {
	let pos = new THREE.Vector3();
	let min = new THREE.Vector3(Infinity, Infinity, Infinity).min(fromV).min(toV);
	let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
		.max(fromV)
		.max(toV);

	if (!Number.isFinite(min.length()) || !Number.isFinite(max.length())) return;

	for (let x = min.x; x <= max.x; x++) {
		for (let y = min.y; y <= max.y; y++) {
			for (let z = min.z; z <= max.z; z++) {
				chunk.removeBlock(pos.set(x, y, z));
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
export function drawSphere(chunk, center, radius, block, type = "solid") {}

/**
 * copies blocks from one chunk to another
 * @param  {VoxelMap|VoxelChunk|VoxelSelection} fromChunk
 * @param  {VoxelMap|VoxelChunk|VoxelSelection} toChunk
 * @param  {THREE.Vector3} from the start position
 * @param  {THREE.Vector3} to the end position
 * @param  {Object} [opts]
 * @param  {THREE.Vector3} [opts.offset] - offset to be applied to the blocks
 * @param  {Boolean} [opts.cloneBlocks=true] - whether or not to clone the blocks, by default it will use the blockManager on toChunk
 * @param  {Boolean} [opts.copyEmpty=false] - whether it should only copy the empty spaces
 * @param  {Boolean} [opts.keepOffset=true] - if it should keep the original position of the blocks or place them reletive to fromV in toChunk
 */
export function copyBlocks(fromChunk, toChunk, fromV, toV, opts) {
	opts = Object.assign(
		{
			cloneBlocks: true,
			copyEmpty: false,
			keepOffset: true,
			offset: new THREE.Vector3(),
		},
		opts || {},
	);

	let fromPos = new THREE.Vector3();
	let toPos = new THREE.Vector3();
	let min = new THREE.Vector3(Infinity, Infinity, Infinity).min(fromV).min(toV);
	let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
		.max(fromV)
		.max(toV);

	if (!Number.isFinite(min.length()) || !Number.isFinite(max.length())) return;

	for (let x = min.x; x <= max.x; x++) {
		for (let y = min.y; y <= max.y; y++) {
			for (let z = min.z; z <= max.z; z++) {
				fromPos.set(x, y, z);
				toPos.copy(fromPos);

				if (!opts.keepOffset) toPos.sub(min);

				toPos.add(opts.offset);

				let block = fromChunk.getBlock(fromPos);
				if (block) {
					if (opts.cloneBlocks && toChunk.blockManager)
						block = toChunk.blockManager.cloneBlock(block);
					else if (block.parent) block.parent.removeBlock(block);

					toChunk.setBlock(block, toPos);
				} else if (opts.copyEmpty) {
					toChunk.removeBlock(toPos);
				}
			}
		}
	}
}

/**
 * @param  {VoxelMap|VoxelChunk|VoxelSelection} chunk
 * @param  {THREE.Box3} box - a box that is used to select the blocks to rotate
 * @param  {THREE.Vector3} around - the point to rotate around
 * @param  {THREE.Quaternion} quaternion
 * @param  {Object} [opts] - additional options
 * @param  {THREE.Vector3} [opts.offset] - offset to be applied to the blocks after its been rotated
 * @param  {Boolean} [opts.cloneBlocks=false] - whether or not to clone the blocks, by default it will use the blockManager on chunk
 * @param  {Boolean} [opts.ignoreEmpty=false] - whether to ignore the empty spaces
 */
export function rotateBlocks(chunk, box, around, quaternion, opts) {
	opts = Object.assign(
		{
			cloneBlocks: false,
			ignoreEmpty: false,
			offset: new THREE.Vector3(),
		},
		opts || {},
	);

	let blocks = [];
	let pos = new THREE.Vector3();
	for (let x = box.min.x; x <= box.max.x; x++) {
		for (let y = box.min.y; y <= box.max.y; y++) {
			for (let z = box.min.z; z <= box.max.z; z++) {
				let block = chunk.getBlock(pos.set(x, y, z));

				if (block) {
					// clone the block, or remove it from its parent
					if (opts.cloneBlocks && chunk.blockManager)
						block = chunk.blockManager.cloneBlock(block);
					else block.parent.removeBlock(block);
				}

				if (opts.ignoreEmpty ? !!block : true)
					blocks.push([block, pos.toString()]);
			}
		}
	}

	let half = new THREE.Vector3(0.5, 0.5, 0.5);
	blocks.forEach(data => {
		let block = data[0];
		pos.fromString(data[1]);

		// apply transform
		pos
			.add(half)
			.sub(around)
			.applyQuaternion(quaternion)
			.add(around)
			.sub(half)
			.add(opts.offset)
			.round();

		// set the block
		if (block) chunk.setBlock(block, pos);
		else chunk.removeBlock(pos);
	});
}
