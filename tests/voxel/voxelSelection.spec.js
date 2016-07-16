import VoxelMap from '../../src/js/voxel/VoxelMap.js';
import VoxelChunk from '../../src/js/voxel/VoxelChunk.js';
import VoxelSelection from '../../src/js/voxel/VoxelSelection.js';
import VoxelBlock from '../../src/js/voxel/VoxelBlock.js';
import VoxelBlockManager from '../../src/js/voxel/VoxelBlockManager.js';
import THREE from 'three';

describe('VoxelChunk', function() {
	beforeAll(function(){
		this.selection = new VoxelSelection(new VoxelBlockManager());

		// register default block
		this.selection.blockManager.registerBlock(VoxelBlock);
	});

	it('blockSize is a THREE.Vector3', function() {
		expect(this.selection.blockSize).toBeDefined();
		expect(this.selection.blockSize instanceof THREE.Vector3).toBe(true);
	});

	describe('empty', function() {
		it('is true if selection is empty', function() {
			this.selection.clearBlocks();
			expect(this.selection.empty).toBe(true);
		});
	});

	describe('size', function() {
		it('returns the size in blocks', function() {
			this.selection.clearBlocks();
			this.selection.createBlock('block', '0,0,0');
			this.selection.createBlock('block', '1,1,1');
			expect(this.selection.size.equals(new THREE.Vector3(2,2,2))).toBe(true);
		});

		it('returns an empty vector if there are not blocks', function() {
			this.selection.clearBlocks();
			expect(this.selection.size.empty()).toBe(true);
		});
	});

	// blocks
	describe('createBlock', function() {
		it('returns created block', function() {
			expect(this.selection.createBlock('block', '1,1,1') instanceof VoxelBlock).toBe(true);
		});

		it('creates a block at position', function() {
			let block = this.selection.createBlock('block', '0,0,0');
			expect(this.selection.getBlock('0,0,0')).toBe(block);
		});
	});

	describe('hasBlock', function() {
		beforeAll(function(){
			this.block = this.selection.createBlock('block', '0,0,0');
		});

		it('hasBlock(THREE.Vector3)', function() {
			expect(this.selection.hasBlock(new THREE.Vector3(0,0,0))).toBe(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.selection.hasBlock('0,0,0')).toBe(true);
		});

		it('hasBlock(VoxelBlock)', function() {
			expect(this.selection.hasBlock(this.block)).toBe(true);
		});
	});

	describe('getBlock', function() {
		beforeAll(function(){
			this.block = this.selection.createBlock('block', '0,0,0');
		});

		it('getBlock(THREE.Vector3)', function() {
			expect(this.selection.getBlock(new THREE.Vector3(0,0,0))).toBe(this.block);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.selection.getBlock('0,0,0')).toBe(this.block);
		});

		describe('getBlock(VoxelBlock)', function() {
			it('returns block if its in the map', function() {
				expect(this.selection.getBlock(this.block)).toBe(this.block);
			});

			it('returns undefined if the block in not in the map', function() {
				expect(this.selection.getBlock(new VoxelBlock())).toBe(undefined);
			});
		});
	});

	describe('removeBlock', function() {
		beforeEach(function(){
			this.block = this.selection.createBlock('0,0,0');
		});

		it('removeBlock(THREE.Vector3)', function() {
			let vec = new THREE.Vector3(0,0,0);
			this.selection.removeBlock(vec);
			expect(this.selection.hasBlock(vec)).toBe(false);
			expect(this.selection.getBlock(vec)).toBe(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.selection.removeBlock('0,0,0');
			expect(this.selection.hasBlock('0,0,0')).toBe(false);
			expect(this.selection.getBlock('0,0,0')).toBe(undefined);
		});

		it('removeBlock(VoxelBlock)', function() {
			this.selection.removeBlock(this.block);
			expect(this.selection.hasBlock(this.block)).toBe(false);
			expect(this.selection.getBlock(this.block)).toBe(undefined);
		});
	});

	describe('clearBlocks', function() {
		beforeAll(function(){
			this.selection.createBlock('block', '0,0,0');
			this.selection.clearBlocks();
		});

		it('removes all blocks in map', function() {
			expect(this.selection.getBlock('0,0,0')).toBe(undefined);
		});
	});

	describe('addTo', function() {
		beforeAll(function(){
			this.selection.clearBlocks();
			this.selection.createBlock('block', '0,0,0');
			this.selection.createBlock('block', '1,1,1');
		})

		it('addTo(VoxelMap)', function() {
			let map = new VoxelMap();
			this.selection.addTo(map, new THREE.Vector3(1,1,1));

			expect(map.getBlock('1,1,1') instanceof VoxelBlock).toBe(true);
			expect(map.getBlock('2,2,2') instanceof VoxelBlock).toBe(true);
		});

		it('addTo(VoxelSelection)', function() {
			let selection = new VoxelSelection();
			this.selection.addTo(selection, new THREE.Vector3(1,1,1));

			expect(selection.getBlock('1,1,1') instanceof VoxelBlock).toBe(true);
			expect(selection.getBlock('2,2,2') instanceof VoxelBlock).toBe(true);
			expect(selection.size.equals(new THREE.Vector3(2,2,2))).toBe(true);
		});
	});

	describe('copyFrom', function() {
		it('copyFrom(VoxelSelection)', function() {
			this.selection.clearBlocks();
			let selection = new VoxelSelection();
			selection.createBlock('block', '0,0,0');
			selection.createBlock('block', '1,1,1');

			this.selection.copyFrom(selection, new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));

			expect(this.selection.getBlock('0,0,0') instanceof VoxelBlock).toBe(true);
			expect(this.selection.getBlock('1,1,1') instanceof VoxelBlock).toBe(true);
			expect(this.selection.size.equals(new THREE.Vector3(2,2,2))).toBe(true);
		});

		it('dont clone', function() {
			this.selection.clearBlocks();
			let selection = new VoxelSelection();
			selection.createBlock('block', '0,0,0');
			selection.createBlock('block', '1,1,1');

			this.selection.copyFrom(selection, new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1), false);

			expect(this.selection.getBlock('0,0,0') instanceof VoxelBlock).toBe(true);
			expect(this.selection.getBlock('1,1,1') instanceof VoxelBlock).toBe(true);
			expect(this.selection.size.equals(new THREE.Vector3(2,2,2))).toBe(true);
			expect(selection.size.empty()).toBe(true);
		});
	});
});
