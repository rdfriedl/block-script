import VoxelMap from '../../src/js/voxel/VoxelMap.js';
import VoxelChunk from '../../src/js/voxel/VoxelChunk.js';
import VoxelBlock from '../../src/js/voxel/VoxelBlock.js';
import VoxelBlockManager from '../../src/js/voxel/VoxelBlockManager.js';
import THREE from 'three';

describe('VoxelMap', function() {
	beforeAll(function(){
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);
	});

	it('is an instance of THREE.Group', function() {
		expect(this.map instanceof THREE.Group).toBe(true);
	});

	it('blockSize is a THREE.Vector3', function() {
		expect(this.map.blockSize).toBeDefined();
		expect(this.map.blockSize instanceof THREE.Vector3).toBe(true);
	});

	it('chunkSize is a THREE.Vector3', function() {
		expect(this.map.chunkSize).toBeDefined();
		expect(this.map.chunkSize instanceof THREE.Vector3).toBe(true);
	});

	describe('blockManager', function() {
		it('instanceof VoxelBlockManager', function() {
			expect(this.map.blockManager instanceof VoxelBlockManager).toBe(true);
		});
	});

	// chunks
	describe('createChunk', function() {
		beforeAll(function(){
			this.chunk = this.map.createChunk('0,0,0');
		});

		it('returns a new VoxelChunk', function() {
			expect(this.chunk instanceof VoxelChunk).toBe(true);
		});

		it('add the chunk to the map', function() {
			expect(this.map.getChunk('0,0,0')).toBe(this.chunk);
		});
	});

	describe('hasChunk', function() {
		beforeAll(function(){
			this.chunk = this.map.createChunk('0,0,0');
		});

		it('hasChunk(THREE.Vector3)', function() {
			expect(this.map.hasChunk(new THREE.Vector3(0,0,0))).toBe(true);
		});

		it('hasChunk("x,y,z")', function() {
			expect(this.map.hasChunk('0,0,0')).toBe(true);
		});

		it('hasChunk(VoxelChunk)', function() {
			expect(this.map.hasChunk(this.chunk)).toBe(true);
		});
	});

	describe('getChunk', function() {
		beforeAll(function(){
			this.chunk = this.map.createChunk('0,0,0');
		});

		describe('getChunk(THREE.Vector3)', function() {
			it('returns chunk at that position', function() {
				expect(this.map.getChunk(new THREE.Vector3(0,0,0))).toBe(this.chunk);
			});
		});

		describe('getChunk("x,y,z")', function() {
			it('returns chunk at that position', function() {
				expect(this.map.getChunk('0,0,0')).toBe(this.chunk);
			});
		});

		describe('getChunk(VoxelChunk)', function() {
			it('returns the chunk if its in this map', function() {
				expect(this.map.getChunk(this.chunk)).toBe(this.chunk);
			});

			it('returns undefined it the map dose not have the chunk', function() {
				expect(this.map.getChunk(new VoxelChunk)).toBe(undefined);
			});
		});
	});

	describe('removeChunk', function() {
		beforeEach(function(){
			this.chunk = this.map.createChunk('0,0,0');
		});

		it('removeChunk(THREE.Vector3)', function() {
			let vec = new THREE.Vector3(0,0,0);
			this.map.removeChunk(vec);
			expect(this.map.hasChunk(vec)).toBe(false);
			expect(this.map.getChunk(vec)).toBe(undefined);
		});

		it('removeChunk("x,y,z")', function() {
			this.map.removeChunk('0,0,0');
			expect(this.map.hasChunk('0,0,0')).toBe(false);
			expect(this.map.getChunk('0,0,0')).toBe(undefined);
		});

		it('removeChunk(VoxelChunk)', function() {
			this.map.removeChunk(this.chunk);
			expect(this.map.hasChunk(this.chunk)).toBe(false);
			expect(this.map.getChunk(this.chunk)).toBe(undefined);
		});
	});

	describe('clearChunks', function() {
		it('removes all chunks in map', function() {
			this.map.createChunk('0,0,0');
			this.map.clearChunks();
			expect(this.map.listChunks().length).toBe(0);
		});
	});

	describe('getChunkPosition', function() {
		beforeAll(function(){
			this.chunk = this.map.createChunk('0,0,0');
		});

		it('returns the position of the chunk', function() {
			expect(this.map.getChunkPosition(this.chunk).equals(new THREE.Vector3(0,0,0))).toBe(true);
		});

		it('returns undefined if the chunk is not in the map', function() {
			expect(this.map.getChunkPosition(new VoxelChunk)).toBe(undefined);
		});
	});

	describe('listChunks', function() {
		it('returns array of chunks', function() {
			this.map.clearChunks();
			this.map.createChunk('0,0,0');
			this.map.createChunk('0,1,0');
			this.map.createChunk('0,2,0');
			expect(this.map.listChunks().length).toBe(3);
		});
	});

	// blocks
	describe('createBlock', function() {
		it('returns created block', function() {
			expect(this.map.createBlock('block', '1,1,1') instanceof VoxelBlock).toBe(true);
		});

		it('creates a block at position', function() {
			let block = this.map.createBlock('block', '0,0,0');
			expect(this.map.getBlock('0,0,0')).toBe(block);
		});
	});

	describe('hasBlock', function() {
		beforeAll(function(){
			this.block = this.map.createBlock('block', '0,0,0');
		});

		it('hasBlock(THREE.Vector3)', function() {
			expect(this.map.hasBlock(new THREE.Vector3(0,0,0))).toBe(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.map.hasBlock('0,0,0')).toBe(true);
		});

		it('hasBlock(VoxelBlock)', function() {
			expect(this.map.hasBlock(this.block)).toBe(true);
		});
	});

	describe('getBlock', function() {
		beforeAll(function(){
			this.block = this.map.createBlock('block', '0,0,0');
		});

		it('getBlock(THREE.Vector3)', function() {
			expect(this.map.getBlock(new THREE.Vector3(0,0,0))).toBe(this.block);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.map.getBlock('0,0,0')).toBe(this.block);
		});

		describe('getBlock(VoxelBlock)', function() {
			it('returns block if its in the map', function() {
				expect(this.map.getBlock(this.block)).toBe(this.block);
			});

			it('returns undefined if the block in not in the map', function() {
				expect(this.map.getBlock(new VoxelBlock())).toBe(undefined);
			});
		});
	});

	describe('removeBlock', function() {
		beforeEach(function(){
			this.block = this.map.createBlock('0,0,0');
		});

		it('removeBlock(THREE.Vector3)', function() {
			let vec = new THREE.Vector3(0,0,0);
			this.map.removeBlock(vec);
			expect(this.map.hasBlock(vec)).toBe(false);
			expect(this.map.getBlock(vec)).toBe(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.map.removeBlock('0,0,0');
			expect(this.map.hasBlock('0,0,0')).toBe(false);
			expect(this.map.getBlock('0,0,0')).toBe(undefined);
		});

		it('removeBlock(VoxelBlock)', function() {
			this.map.removeBlock(this.block);
			expect(this.map.hasBlock(this.block)).toBe(false);
			expect(this.map.getBlock(this.block)).toBe(undefined);
		});
	});

	describe('clearBlocks', function() {
		beforeAll(function(){
			this.map.createBlock('block', '0,0,0');
			this.map.clearBlocks();
		});

		it('removes all blocks in map', function() {
			expect(this.map.getBlock('0,0,0')).toBe(undefined);
		});

		it('keeps the chunks', function() {
			expect(this.map.listChunks().length).toBeGreaterThan(0);
		});
	});
});
