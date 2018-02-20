import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import * as THREE from "three";

/** @test {VoxelChunk} */
describe("VoxelChunk", () => {
	let map, chunk;

	beforeEach(() => {
		map = new VoxelMap(new VoxelBlockManager());

		// register default block
		map.blockManager.registerBlock(VoxelBlock);

		//create chunk
		chunk = map.createChunk(new THREE.Vector3());
	});

	it("is an instance of THREE.Group", () => {
		expect(chunk).to.an.instanceOf(THREE.Group);
	});

	it("blockSize is a THREE.Vector3", () => {
		expect(chunk.blockSize).not.to.be.undefined;
		expect(chunk.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkSize is a THREE.Vector3", () => {
		expect(chunk.chunkSize).not.to.be.undefined;
		expect(chunk.chunkSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkPosition is a THREE.Vector3", () => {
		expect(chunk.chunkPosition).not.to.be.undefined;
		expect(chunk.chunkPosition).to.be.an.instanceOf(THREE.Vector3);
	});
	it("worldPosition is a THREE.Vector3", () => {
		expect(chunk.worldPosition).not.to.be.undefined;
		expect(chunk.worldPosition).to.be.an.instanceOf(THREE.Vector3);
	});
	it("scenePosition is a THREE.Vector3", () => {
		expect(chunk.scenePosition).not.to.be.undefined;
		expect(chunk.scenePosition).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("parent", () => {
		it('"parent" points to parent', () => {
			expect(chunk.parent).to.equal(map);
		});

		it('"map" points to parent VoxelMap', () => {
			expect(chunk.map).to.equal(map);
		});
	});

	describe("empty", () => {
		it("is true if chunk is empty", () => {
			chunk.clearBlocks();
			expect(chunk.empty).to.be.true;
		});
	});

	describe("createBlock", () => {
		it("returns created block", () => {
			expect(chunk.createBlock("block", new THREE.Vector3(1, 1, 1))).to.be.an.instanceOf(VoxelBlock);
		});

		it("creates a block at position", () => {
			let block = chunk.createBlock("block", new THREE.Vector3(0, 0, 0));
			expect(chunk.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("hasBlock", () => {
		let block;

		beforeEach(() => {
			block = chunk.createBlock("block", new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			expect(chunk.hasBlock(new THREE.Vector3(0, 0, 0))).to.be.true;
		});

		it('("x,y,z")', () => {
			expect(chunk.hasBlock(new THREE.Vector3())).to.be.true;
		});

		it("(VoxelBlock)", () => {
			expect(chunk.hasBlock(block)).to.be.true;
		});
	});

	describe("getBlock", () => {
		let block;

		beforeEach(() => {
			block = chunk.createBlock("block", new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			expect(chunk.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(block);
		});

		it('("x,y,z")', () => {
			expect(chunk.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("setBlock()", () => {
		it("(VoxelBlock, THREE.Vector3)", () => {
			let block = new VoxelBlock();
			block.setProp("type", "test");
			chunk.setBlock(block, new THREE.Vector3(3, 3, 3));
			expect(chunk.getBlock(new THREE.Vector3(3, 3, 3))).to.equal(block);
		});

		it("(ID, THREE.Vector3)", () => {
			chunk.setBlock("block", new THREE.Vector3(3, 3, 3));
			expect(chunk.getBlock(new THREE.Vector3(3, 3, 3))).to.be.an.instanceOf(VoxelBlock);
		});
	});

	describe("removeBlock", () => {
		let block;

		beforeEach(() => {
			block = chunk.createBlock(new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			let vec = new THREE.Vector3(0, 0, 0);
			chunk.removeBlock(vec);
			expect(chunk.hasBlock(vec)).to.be.false;
			expect(chunk.getBlock(vec)).to.be.undefined;
		});

		it('("x,y,z")', () => {
			chunk.removeBlock(new THREE.Vector3());
			expect(chunk.hasBlock(new THREE.Vector3())).to.be.false;
			expect(chunk.getBlock(new THREE.Vector3())).to.be.undefined;
		});

		it("(VoxelBlock)", () => {
			chunk.removeBlock(block);
			expect(chunk.hasBlock(block)).to.be.false;
			expect(chunk.getBlock(block)).to.be.undefined;
		});
	});

	describe("clearBlocks", () => {
		beforeEach(() => {
			chunk.createBlock("block", new THREE.Vector3());
			chunk.clearBlocks();
		});

		it("removes all blocks in chunk", () => {
			expect(chunk.getBlock(new THREE.Vector3())).to.be.undefined;
		});
	});

	describe("chunkSize", () => {
		it("returns THREE.Vector3", () => {
			expect(chunk.chunkSize).to.be.an.instanceOf(THREE.Vector3);
		});
		it("returns empty vector if the chunk dose not have a map", () => {
			map.removeChunk(chunk);
			expect(chunk.chunkSize.equals(new THREE.Vector3())).to.be.true;
		});
	});
});
