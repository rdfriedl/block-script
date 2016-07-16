import VoxelBlock from '../../src/js/voxel/VoxelBlock.js';
import VoxelBlockManager from '../../src/js/voxel/VoxelBlockManager.js';
import * as blocks from '../../src/js/blocks.js';

describe('VoxelBlockManager', function() {
	beforeAll(function(){
		this.manager = new VoxelBlockManager();
		this.manager.registerBlock(blocks);
	});

	describe('hasBlock', function() {
		it('hasBlock(String)', function() {
			expect(this.manager.hasBlock('dirt')).toBe(true);
		});
	});

	describe('getBlock', function() {
		it('getBlock(String)', function() {
			expect(this.manager.getBlock('dirt')).toBe(blocks.Dirt);
		});

		it('getBlock(Class)', function() {
			expect(this.manager.getBlock(blocks.Dirt)).toBe(blocks.Dirt);
		});

		it('getBlock(VoxelBlock)', function() {
			expect(this.manager.getBlock(new blocks.Dirt)).toBe(blocks.Dirt);
		});
	});

	describe('createBlock', function() {
		it('createBlock(String)', function() {
			expect(this.manager.createBlock('dirt') instanceof VoxelBlock).toBe(true);
		});

		it('createBlock(Class)', function() {
			expect(this.manager.createBlock(blocks.Dirt) instanceof VoxelBlock).toBe(true);
		});

		it('createBlock(VoxelBlock)', function() {
			expect(this.manager.createBlock(new blocks.Dirt) instanceof VoxelBlock).toBe(true);
		});

		it('returns undefined if the manager dose not have the block', function() {
			expect(this.manager.createBlock('adfahad')).toBe(undefined);
		});

		it('get block from pool if pool is enabled', function() {
			this.manager.usePool = true;
			// add block to the pool
			let oldBlock = new blocks.Dirt()
			this.manager.disposeBlock(oldBlock);

			let block = this.manager.createBlock('dirt');

			expect(block).toBe(oldBlock);
			expect(block instanceof VoxelBlock).toBe(true);

			this.manager.usePool = false;
		});

		it('sets data', function() {
			let block;

			// with pool
			this.manager.usePool = true;
			this.manager.disposeBlock(new blocks.Dirt());
			block = this.manager.createBlock('dirt',{properties: {testing: 'test'}});
			expect(block.getProp('testing')).toBe('test');

			// without pool
			this.manager.usePool = false;
			block = this.manager.createBlock('dirt',{properties: {testing: 'test'}});
			expect(block.getProp('testing')).toBe('test');
		});
	});
});
