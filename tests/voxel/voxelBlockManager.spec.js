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

	it('getBlock', function() {
		expect(this.manager.getBlock('dirt') instanceof Function).toBe(true);
	});

	describe('createBlock', function() {
		it('returns new VoxelBlock', function() {
			expect(this.manager.createBlock('dirt') instanceof VoxelBlock).toBe(true);
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
