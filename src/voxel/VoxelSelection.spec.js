import VoxelSelection from "./VoxelSelection.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import * as THREE from "three";

/** @test {VoxelSelection} */
describe("VoxelSelection", () => {
	let selection;

	beforeEach(() => {
		selection = new VoxelSelection(new VoxelBlockManager());

		// register default block
		selection.blockManager.registerBlock(VoxelBlock);
	});

	it("blockSize is a THREE.Vector3", () => {
		expect(selection.blockSize).not.to.be.undefined;
		expect(selection.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("empty", () => {
		it("is true if selection is empty", () => {
			selection.clearBlocks();
			expect(selection.empty).to.be.true;
		});
	});

	describe("size", () => {
		it("returns the size in blocks", () => {
			selection.clearBlocks();
			selection.createBlock("block", new THREE.Vector3());
			selection.createBlock("block", new THREE.Vector3(1, 1, 1));
			expect(selection.size.equals(new THREE.Vector3(2, 2, 2))).to.equal(true);
		});

		it("returns an empty vector if there are not blocks", () => {
			selection.clearBlocks();
			expect(selection.size.empty()).to.be.true;
		});
	});

	// blocks
	describe("createBlock", () => {
		it("returns created block", () => {
			expect(selection.createBlock("block", new THREE.Vector3(1, 1, 1))).to.be.an.instanceOf(VoxelBlock);
		});

		it("(ID, THREE.Vector3) creates a block at position", () => {
			let block = selection.createBlock("block", new THREE.Vector3());
			expect(selection.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("setBlock()", () => {
		it("(VoxelBlock, THREE.Vector3)", () => {
			let block = new VoxelBlock();
			block.setProp("type", "test");
			selection.setBlock(block, new THREE.Vector3(3, 3, 3));
			expect(selection.getBlock(new THREE.Vector3(3, 3, 3))).to.equal(block);
		});

		it("(ID, THREE.Vector3)", () => {
			selection.setBlock("block", new THREE.Vector3(3, 3, 3));
			expect(selection.getBlock(new THREE.Vector3(3, 3, 3))).to.be.an.instanceOf(VoxelBlock);
		});
	});

	describe("hasBlock", () => {
		let block;

		beforeEach(() => {
			block = selection.createBlock("block", new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			expect(selection.hasBlock(new THREE.Vector3(0, 0, 0))).to.be.true;
		});

		it("(VoxelBlock)", () => {
			expect(selection.hasBlock(block)).to.be.true;
		});
	});

	describe("getBlock", () => {
		let block;

		beforeEach(() => {
			block = selection.createBlock("block", new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			expect(selection.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(block);
		});

		it("(THREE.Vector3)", () => {
			expect(selection.getBlock(block)).to.equal(block);
			expect(selection.getBlock(new VoxelBlock())).to.be.undefined;
		});
	});

	describe("removeBlock", () => {
		let block;

		beforeEach(() => {
			block = selection.createBlock("block", new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			let vec = new THREE.Vector3(0, 0, 0);
			selection.removeBlock(vec);

			expect(selection.hasBlock(vec)).to.be.false;
			expect(selection.getBlock(vec)).to.be.undefined;
		});

		it("(VoxelBlock)", () => {
			selection.removeBlock(block);

			expect(selection.hasBlock(block)).to.be.false;
			expect(selection.getBlock(block)).to.be.undefined;
		});
	});

	describe("clearBlocks", () => {
		beforeEach(() => {
			selection.createBlock("block", new THREE.Vector3());
			selection.clearBlocks();
		});

		it("removes all blocks in selection", () => {
			expect(selection.getBlock(new THREE.Vector3())).to.be.undefined;
		});
	});
});
