import VoxelMap from "./VoxelMap.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelSelection from "./VoxelSelection.js";
import THREE from "three";

/** @test {VoxelBlock} */
describe("VoxelBlock", function() {
	before(function() {
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);
		this.block = this.map.createBlock("block", new THREE.Vector3());
	});

	describe("UID", function() {
		it("block.id is equal to the UID of the block", function() {
			expect(this.block.id).to.equal(VoxelBlock.UID);
		});
	});

	describe("parent", function() {
		before(function() {
			this.selection = new VoxelSelection();
			this.chunk = this.map.createChunk(new THREE.Vector3(1, 1, 1));
			this.block = new VoxelBlock();
		});
		it('"parent" points to parent chunk or selection', function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.selection.setBlock(this.block, new THREE.Vector3());
			expect(this.block.parent).to.equal(this.selection);

			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.chunk.setBlock(this.block, new THREE.Vector3());
			expect(this.block.parent).to.equal(this.chunk);
		});

		it('"chunk" points to parent chunk, but not parent selection', function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.selection.setBlock(this.block, new THREE.Vector3());
			expect(this.block.chunk).to.equal(undefined);

			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.chunk.setBlock(this.block, new THREE.Vector3());
			expect(this.block.chunk).to.equal(this.chunk);
		});

		it('"selection" points to parent selection, but not parent chunk', function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.selection.setBlock(this.block, new THREE.Vector3());
			expect(this.block.selection).to.equal(this.selection);

			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.chunk.setBlock(this.block, new THREE.Vector3());
			expect(this.block.selection).to.equal(undefined);
		});
	});

	describe("worldPosition", function() {
		it("returns THREE.Vector3", function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.map.setBlock(this.block, new THREE.Vector3());
			expect(this.block.worldPosition).to.be.an.instanceOf(THREE.Vector3);
		});

		it("returns empty Vec3 when not in a map", function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			expect(this.block.worldPosition).to.be.an.instanceOf(THREE.Vector3);
		});
	});

	describe("position", function() {
		it("returns THREE.Vector3", function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			this.map.setBlock(this.block, new THREE.Vector3());
			expect(this.block.position).to.be.an.instanceOf(THREE.Vector3);
		});

		it("returns empty Vec3 when not in a map or selection", function() {
			if (this.block.parent) this.block.parent.removeBlock(this.block);
			expect(this.block.position).to.be.an.instanceOf(THREE.Vector3);
		});
	});

	describe("geometry", function() {
		it("caches geometry", function() {
			expect(this.block.geometry).to.equal(this.block.geometry);
		});
	});

	describe("material", function() {
		it("caches material", function() {
			expect(this.block.material).to.equal(this.block.material);
		});
	});
});
