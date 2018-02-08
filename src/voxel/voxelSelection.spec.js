import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelSelection from "./VoxelSelection.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import THREE from "three";

describe("VoxelChunk", function() {
	beforeAll(function() {
		this.selection = new VoxelSelection(new VoxelBlockManager());

		// register default block
		this.selection.blockManager.registerBlock(VoxelBlock);
	});

	it("blockSize is a THREE.Vector3", function() {
		expect(this.selection.blockSize).toBeDefined();
		expect(this.selection.blockSize instanceof THREE.Vector3).toBe(true);
	});

	describe("empty", function() {
		it("is true if selection is empty", function() {
			this.selection.clearBlocks();
			expect(this.selection.empty).toBe(true);
		});
	});

	describe("size", function() {
		it("returns the size in blocks", function() {
			this.selection.clearBlocks();
			this.selection.createBlock("block", new THREE.Vector3());
			this.selection.createBlock("block", new THREE.Vector3(1, 1, 1));
			expect(this.selection.size.equals(new THREE.Vector3(2, 2, 2))).toBe(true);
		});

		it("returns an empty vector if there are not blocks", function() {
			this.selection.clearBlocks();
			expect(this.selection.size.empty()).toBe(true);
		});
	});

	// blocks
	describe("createBlock", function() {
		it("returns created block", function() {
			expect(
				this.selection.createBlock(
					"block",
					new THREE.Vector3(1, 1, 1),
				) instanceof VoxelBlock,
			).toBe(true);
		});

		it("creates a block at position", function() {
			let block = this.selection.createBlock("block", new THREE.Vector3());
			expect(this.selection.getBlock(new THREE.Vector3())).toBe(block);
		});
	});

	describe("setBlock()", function() {
		it("setBlock(VoxelBlock, Vec3)", function() {
			let block = new VoxelBlock();
			block.setProp("type", "test");
			this.selection.setBlock(block, new THREE.Vector3(3, 3, 3));
			expect(this.selection.getBlock(new THREE.Vector3(3, 3, 3))).toBe(block);
		});
	});

	describe("hasBlock", function() {
		beforeAll(function() {
			this.block = this.selection.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", function() {
			expect(this.selection.hasBlock(new THREE.Vector3(0, 0, 0))).toBe(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.selection.hasBlock(new THREE.Vector3())).toBe(true);
		});

		it("hasBlock(VoxelBlock)", function() {
			expect(this.selection.hasBlock(this.block)).toBe(true);
		});
	});

	describe("getBlock", function() {
		beforeAll(function() {
			this.block = this.selection.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", function() {
			expect(this.selection.getBlock(new THREE.Vector3(0, 0, 0))).toBe(
				this.block,
			);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.selection.getBlock(new THREE.Vector3())).toBe(this.block);
		});

		describe("getBlock(VoxelBlock)", function() {
			it("returns block if its in the map", function() {
				expect(this.selection.getBlock(this.block)).toBe(this.block);
			});

			it("returns undefined if the block in not in the map", function() {
				expect(this.selection.getBlock(new VoxelBlock())).toBe(undefined);
			});
		});
	});

	describe("removeBlock", function() {
		beforeEach(function() {
			this.block = this.selection.createBlock(new THREE.Vector3());
		});

		it("removeBlock(THREE.Vector3)", function() {
			let vec = new THREE.Vector3(0, 0, 0);
			this.selection.removeBlock(vec);
			expect(this.selection.hasBlock(vec)).toBe(false);
			expect(this.selection.getBlock(vec)).toBe(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.selection.removeBlock(new THREE.Vector3());
			expect(this.selection.hasBlock(new THREE.Vector3())).toBe(false);
			expect(this.selection.getBlock(new THREE.Vector3())).toBe(undefined);
		});

		it("removeBlock(VoxelBlock)", function() {
			this.selection.removeBlock(this.block);
			expect(this.selection.hasBlock(this.block)).toBe(false);
			expect(this.selection.getBlock(this.block)).toBe(undefined);
		});
	});

	describe("clearBlocks", function() {
		beforeAll(function() {
			this.selection.createBlock("block", new THREE.Vector3());
			this.selection.clearBlocks();
		});

		it("removes all blocks in map", function() {
			expect(this.selection.getBlock(new THREE.Vector3())).toBe(undefined);
		});
	});
});
