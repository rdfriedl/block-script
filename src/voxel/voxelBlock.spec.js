import VoxelMap from "./VoxelMap.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelSelection from "./VoxelSelection.js";
import * as THREE from "three";

/** @test {VoxelBlock} */
describe("VoxelBlock", () => {
	let block, map;

	beforeEach(() => {
		map = new VoxelMap();

		// register default block
		map.blockManager.registerBlock(VoxelBlock);
		block = map.createBlock("block", new THREE.Vector3());
	});

	describe("UID", () => {
		it("block.id is equal to the UID of the block class", () => {
			expect(block.id).to.equal(VoxelBlock.UID);
		});
	});

	/** @test {VoxelBlock#parent} */
	describe("parent", () => {
		let selection, chunk;

		beforeEach(() => {
			selection = new VoxelSelection();
			chunk = map.createChunk(new THREE.Vector3(1, 1, 1));
			block = new VoxelBlock();
		});

		it('"parent" points to parent chunk or selection', () => {
			selection.setBlock(block, new THREE.Vector3());
			expect(block.parent).to.equal(selection);

			if (block.parent) block.parent.removeBlock(block);
			chunk.setBlock(block, new THREE.Vector3());
			expect(block.parent).to.equal(chunk);
		});

		it('"chunk" points to parent chunk, but not parent selection', () => {
			selection.setBlock(block, new THREE.Vector3());
			expect(block.chunk).to.be.undefined;

			if (block.parent) block.parent.removeBlock(block);
			chunk.setBlock(block, new THREE.Vector3());
			expect(block.chunk).to.equal(chunk);
		});

		it('"selection" points to parent selection, but not parent chunk', () => {
			selection.setBlock(block, new THREE.Vector3());
			expect(block.selection).to.equal(selection);

			if (block.parent) block.parent.removeBlock(block);
			chunk.setBlock(block, new THREE.Vector3());
			expect(block.selection).to.be.undefined;
		});
	});

	describe("worldPosition", () => {
		it("returns THREE.Vector3", () => {
			if (block.parent) block.parent.removeBlock(block);
			map.setBlock(block, new THREE.Vector3());
			expect(block.worldPosition).to.be.an.instanceOf(THREE.Vector3);
		});

		it("returns empty Vec3 when not in a map", () => {
			if (block.parent) block.parent.removeBlock(block);
			expect(block.worldPosition).to.be.an.instanceOf(THREE.Vector3);
		});
	});

	describe("position", () => {
		it("returns THREE.Vector3", () => {
			if (block.parent) block.parent.removeBlock(block);
			map.setBlock(block, new THREE.Vector3());
			expect(block.position).to.be.an.instanceOf(THREE.Vector3);
		});

		it("returns empty Vec3 when not in a map or selection", () => {
			if (block.parent) block.parent.removeBlock(block);
			expect(block.position).to.be.an.instanceOf(THREE.Vector3);
		});
	});

	describe("geometry", () => {
		it("caches geometry", () => {
			expect(block.geometry).to.equal(block.geometry);
		});
	});

	describe("material", () => {
		it("caches material", () => {
			expect(block.material).to.equal(block.material);
		});
	});
});
