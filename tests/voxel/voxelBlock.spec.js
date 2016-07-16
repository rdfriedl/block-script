import VoxelMap from '../../src/js/voxel/VoxelMap.js';
import VoxelChunk from '../../src/js/voxel/VoxelChunk.js';
import VoxelBlock from '../../src/js/voxel/VoxelBlock.js';
import VoxelBlockManager from '../../src/js/voxel/VoxelBlockManager.js';
import VoxelSelection from '../../src/js/voxel/VoxelSelection.js';
import THREE from 'three';

describe('VoxelBlock', function() {
	beforeAll(function(){
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);
		this.block = this.map.createBlock('block', '0,0,0');
	})

	describe('UID', function() {
		it('block.id is equal to the UID of the block', function() {
			this.block.id == VoxelBlock.UID;
		});
	});

	describe('parent', function() {
		beforeAll(function(){
			this.selection = new VoxelSelection();
			this.chunk = new VoxelChunk();
			this.block = new VoxelBlock();
		})
		it('"parent" points to parent chunk or selection', function() {
			this.selection.setBlock(this.block, '0,0,0');
			expect(this.block.parent).toBe(this.selection);

			this.chunk.setBlock(this.block, '0,0,0');
			expect(this.block.parent).toBe(this.chunk);
		});

		it('"chunk" points to parent chunk, but not parent selection', function() {
			this.selection.setBlock(this.block, '0,0,0');
			expect(this.block.chunk).toBe(undefined);

			this.chunk.setBlock(this.block, '0,0,0');
			expect(this.block.chunk).toBe(this.chunk);
		});

		it('"selection" points to parent selection, but not parent chunk', function() {
			this.selection.setBlock(this.block, '0,0,0');
			expect(this.block.selection).toBe(this.selection);

			this.chunk.setBlock(this.block, '0,0,0');
			expect(this.block.selection).toBe(undefined);
		});
	});

	describe('worldPosition', function() {
		it('returns THREE.Vector3', function() {
			this.map.setBlock(this.block, '0,0,0');
			expect(this.block.worldPosition instanceof THREE.Vector3).toBe(true);
		});

		it('returns empty Vec3 when not in a map', function() {
			this.block.parent.removeBlock(this.block);
			expect(this.block.worldPosition.toArray().join(',')).toBe('0,0,0');
		});
	});

	describe('position', function() {
		it('returns THREE.Vector3', function() {
			this.map.setBlock(this.block, '0,0,0');
			expect(this.block.position instanceof THREE.Vector3).toBe(true);
		});

		it('returns empty Vec3 when not in a map or selection', function() {
			this.block.parent.removeBlock(this.block);
			expect(this.block.position.toArray().join(',')).toBe('0,0,0');
		});
	});

	describe('geometry', function() {
		it('caches geometry', function() {
			expect(this.block.geometry).toBe(this.block.geometry);
		});
	});

	describe('material', function() {
		it('caches material', function() {
			expect(this.block.material).toBe(this.block.material);
		});
	});
});
