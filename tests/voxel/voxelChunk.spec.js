import VoxelMap from "../../src/js/voxel/VoxelMap.js";
import VoxelChunk from "../../src/js/voxel/VoxelChunk.js";
import VoxelBlock from "../../src/js/voxel/VoxelBlock.js";
import VoxelBlockManager from "../../src/js/voxel/VoxelBlockManager.js";
import THREE from "three";

describe("VoxelChunk", function() {
	beforeAll(function() {
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);

		//create chunk
		this.chunk = this.map.createChunk(new THREE.Vector3());
	});

	it("is an instance of THREE.Group", function() {
		expect(this.chunk instanceof THREE.Group).toBe(true);
	});

	it("blockSize is a THREE.Vector3", function() {
		expect(this.chunk.blockSize).toBeDefined();
		expect(this.chunk.blockSize instanceof THREE.Vector3).toBe(true);
	});

	it("chunkSize is a THREE.Vector3", function() {
		expect(this.chunk.chunkSize).toBeDefined();
		expect(this.chunk.chunkSize instanceof THREE.Vector3).toBe(true);
	});

	it("chunkPosition is a THREE.Vector3", function() {
		expect(this.chunk.chunkPosition).toBeDefined();
		expect(this.chunk.chunkPosition instanceof THREE.Vector3).toBe(true);
	});
	it("worldPosition is a THREE.Vector3", function() {
		expect(this.chunk.worldPosition).toBeDefined();
		expect(this.chunk.worldPosition instanceof THREE.Vector3).toBe(true);
	});
	it("scenePosition is a THREE.Vector3", function() {
		expect(this.chunk.scenePosition).toBeDefined();
		expect(this.chunk.scenePosition instanceof THREE.Vector3).toBe(true);
	});

	describe("parent", function() {
		it('"parent" points to parent', function() {
			expect(this.chunk.parent).toBeDefined();
			expect(this.chunk.parent).toBe(this.map);
		});

		it('"map" points to parent VoxelMap', function() {
			expect(this.chunk.map).toBeDefined();
			expect(this.chunk.map).toBe(this.map);
		});
	});

	describe("empty", function() {
		it("is true if chunk is empty", function() {
			this.chunk.clearBlocks();
			expect(this.chunk.empty).toBe(true);
		});
	});

	// blocks
	describe("createBlock", function() {
		it("returns created block", function() {
			expect(
				this.chunk.createBlock("block", new THREE.Vector3(1, 1, 1)) instanceof
					VoxelBlock,
			).toBe(true);
		});

		it("creates a block at position", function() {
			let block = this.chunk.createBlock("block", new THREE.Vector3(0, 0, 0));
			expect(this.chunk.getBlock(new THREE.Vector3())).toBe(block);
		});
	});

	describe("hasBlock", function() {
		beforeAll(function() {
			this.block = this.chunk.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", function() {
			expect(this.chunk.hasBlock(new THREE.Vector3(0, 0, 0))).toBe(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.chunk.hasBlock(new THREE.Vector3())).toBe(true);
		});

		it("hasBlock(VoxelBlock)", function() {
			expect(this.chunk.hasBlock(this.block)).toBe(true);
		});
	});

	describe("getBlock", function() {
		beforeAll(function() {
			this.block = this.chunk.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", function() {
			expect(this.chunk.getBlock(new THREE.Vector3(0, 0, 0))).toBe(this.block);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.chunk.getBlock(new THREE.Vector3())).toBe(this.block);
		});

		describe("getBlock(VoxelBlock)", function() {
			it("returns block if its in the map", function() {
				expect(this.chunk.getBlock(this.block)).toBe(this.block);
			});

			it("returns undefined if the block in not in the map", function() {
				expect(this.chunk.getBlock(new VoxelBlock())).toBe(undefined);
			});
		});
	});

	describe("removeBlock", function() {
		beforeEach(function() {
			this.block = this.chunk.createBlock(new THREE.Vector3());
		});

		it("removeBlock(THREE.Vector3)", function() {
			let vec = new THREE.Vector3(0, 0, 0);
			this.chunk.removeBlock(vec);
			expect(this.chunk.hasBlock(vec)).toBe(false);
			expect(this.chunk.getBlock(vec)).toBe(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.chunk.removeBlock(new THREE.Vector3());
			expect(this.chunk.hasBlock(new THREE.Vector3())).toBe(false);
			expect(this.chunk.getBlock(new THREE.Vector3())).toBe(undefined);
		});

		it("removeBlock(VoxelBlock)", function() {
			this.chunk.removeBlock(this.block);
			expect(this.chunk.hasBlock(this.block)).toBe(false);
			expect(this.chunk.getBlock(this.block)).toBe(undefined);
		});
	});

	describe("clearBlocks", function() {
		beforeAll(function() {
			this.chunk.createBlock("block", new THREE.Vector3());
			this.chunk.clearBlocks();
		});

		it("removes all blocks in chunk", function() {
			expect(this.chunk.getBlock(new THREE.Vector3())).toBe(undefined);
		});
	});

	describe("chunkSize", function() {
		it("returns THREE.Vector3", function() {
			expect(this.chunk.chunkSize instanceof THREE.Vector3).toBe(true);
		});
		it("returns empty vector if the chunk dose not have a map", function() {
			let pos = this.chunkPosition;
			this.map.removeChunk(this.chunk);
			expect(this.chunk.chunkSize.equals(new THREE.Vector3())).toBe(true);
			this.map.setChunk(this.chunk, pos);
		});
	});
});
