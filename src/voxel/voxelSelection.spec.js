import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelSelection from "./VoxelSelection.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import THREE from "three";

describe("VoxelChunk", function() {
	before(function() {
		this.selection = new VoxelSelection(new VoxelBlockManager());

		// register default block
		this.selection.blockManager.registerBlock(VoxelBlock);
	});

	it("blockSize is a THREE.Vector3", function() {
		expect(this.selection.blockSize).not.to.be.undefined;
		expect(this.selection.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("empty", function() {
		it("is true if selection is empty", function() {
			this.selection.clearBlocks();
			expect(this.selection.empty).to.equal(true);
		});
	});

	describe("size", function() {
		it("returns the size in blocks", function() {
			this.selection.clearBlocks();
			this.selection.createBlock("block", new THREE.Vector3());
			this.selection.createBlock("block", new THREE.Vector3(1, 1, 1));
			expect(this.selection.size.equals(new THREE.Vector3(2, 2, 2))).to.equal(
				true,
			);
		});

		it("returns an empty vector if there are not blocks", function() {
			this.selection.clearBlocks();
			expect(this.selection.size.empty()).to.equal(true);
		});
	});

	// blocks
	describe("createBlock", function() {
		it("returns created block", function() {
			expect(
				this.selection.createBlock("block", new THREE.Vector3(1, 1, 1)),
			).to.be.an.instanceOf(VoxelBlock);
		});

		it("creates a block at position", function() {
			let block = this.selection.createBlock("block", new THREE.Vector3());
			expect(this.selection.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("setBlock()", function() {
		it("setBlock(VoxelBlock, Vec3)", function() {
			let block = new VoxelBlock();
			block.setProp("type", "test");
			this.selection.setBlock(block, new THREE.Vector3(3, 3, 3));
			expect(this.selection.getBlock(new THREE.Vector3(3, 3, 3))).to.equal(
				block,
			);
		});
	});

	describe("hasBlock", function() {
		before(function() {
			this.block = this.selection.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", function() {
			expect(this.selection.hasBlock(new THREE.Vector3(0, 0, 0))).to.equal(
				true,
			);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.selection.hasBlock(new THREE.Vector3())).to.equal(true);
		});

		it("hasBlock(VoxelBlock)", function() {
			expect(this.selection.hasBlock(this.block)).to.equal(true);
		});
	});

	describe("getBlock", function() {
		before(function() {
			this.block = this.selection.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", function() {
			expect(this.selection.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(
				this.block,
			);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.selection.getBlock(new THREE.Vector3())).to.equal(this.block);
		});

		describe("getBlock(VoxelBlock)", function() {
			it("returns block if its in the map", function() {
				expect(this.selection.getBlock(this.block)).to.equal(this.block);
			});

			it("returns undefined if the block in not in the map", function() {
				expect(this.selection.getBlock(new VoxelBlock())).to.equal(undefined);
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
			expect(this.selection.hasBlock(vec)).to.equal(false);
			expect(this.selection.getBlock(vec)).to.equal(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.selection.removeBlock(new THREE.Vector3());
			expect(this.selection.hasBlock(new THREE.Vector3())).to.equal(false);
			expect(this.selection.getBlock(new THREE.Vector3())).to.equal(undefined);
		});

		it("removeBlock(VoxelBlock)", function() {
			this.selection.removeBlock(this.block);
			expect(this.selection.hasBlock(this.block)).to.equal(false);
			expect(this.selection.getBlock(this.block)).to.equal(undefined);
		});
	});

	describe("clearBlocks", function() {
		before(function() {
			this.selection.createBlock("block", new THREE.Vector3());
			this.selection.clearBlocks();
		});

		it("removes all blocks in map", function() {
			expect(this.selection.getBlock(new THREE.Vector3())).to.equal(undefined);
		});
	});
});
