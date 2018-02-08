import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import THREE from "three";

describe("VoxelChunk", function() {
	before(function() {
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);

		//create chunk
		this.chunk = this.map.createChunk(new THREE.Vector3());
	});

	it("is an instance of THREE.Group", function() {
		expect(this.chunk).to.an.instanceOf(THREE.Group);
	});

	it("blockSize is a THREE.Vector3", function() {
		expect(this.chunk.blockSize).not.to.be.undefined;
		expect(this.chunk.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkSize is a THREE.Vector3", function() {
		expect(this.chunk.chunkSize).not.to.be.undefined;
		expect(this.chunk.chunkSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkPosition is a THREE.Vector3", function() {
		expect(this.chunk.chunkPosition).not.to.be.undefined;
		expect(this.chunk.chunkPosition).to.be.an.instanceOf(THREE.Vector3);
	});
	it("worldPosition is a THREE.Vector3", function() {
		expect(this.chunk.worldPosition).not.to.be.undefined;
		expect(this.chunk.worldPosition).to.be.an.instanceOf(THREE.Vector3);
	});
	it("scenePosition is a THREE.Vector3", function() {
		expect(this.chunk.scenePosition).not.to.be.undefined;
		expect(this.chunk.scenePosition).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("parent", function() {
		it('"parent" points to parent', function() {
			expect(this.chunk.parent).not.to.be.undefined;
			expect(this.chunk.parent).to.equal(this.map);
		});

		it('"map" points to parent VoxelMap', function() {
			expect(this.chunk.map).not.to.be.undefined;
			expect(this.chunk.map).to.equal(this.map);
		});
	});

	describe("empty", function() {
		it("is true if chunk is empty", function() {
			this.chunk.clearBlocks();
			expect(this.chunk.empty).to.equal(true);
		});
	});

	// blocks
	describe("createBlock", function() {
		it("returns created block", function() {
			expect(
				this.chunk.createBlock("block", new THREE.Vector3(1, 1, 1)),
			).to.be.an.instanceOf(VoxelBlock);
		});

		it("creates a block at position", function() {
			let block = this.chunk.createBlock("block", new THREE.Vector3(0, 0, 0));
			expect(this.chunk.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("hasBlock", function() {
		before(function() {
			this.block = this.chunk.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", function() {
			expect(this.chunk.hasBlock(new THREE.Vector3(0, 0, 0))).to.equal(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.chunk.hasBlock(new THREE.Vector3())).to.equal(true);
		});

		it("hasBlock(VoxelBlock)", function() {
			expect(this.chunk.hasBlock(this.block)).to.equal(true);
		});
	});

	describe("getBlock", function() {
		before(function() {
			this.block = this.chunk.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", function() {
			expect(this.chunk.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(
				this.block,
			);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.chunk.getBlock(new THREE.Vector3())).to.equal(this.block);
		});

		describe("getBlock(VoxelBlock)", function() {
			it("returns block if its in the map", function() {
				expect(this.chunk.getBlock(this.block)).to.equal(this.block);
			});

			it("returns undefined if the block in not in the map", function() {
				expect(this.chunk.getBlock(new VoxelBlock())).to.equal(undefined);
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
			expect(this.chunk.hasBlock(vec)).to.equal(false);
			expect(this.chunk.getBlock(vec)).to.equal(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.chunk.removeBlock(new THREE.Vector3());
			expect(this.chunk.hasBlock(new THREE.Vector3())).to.equal(false);
			expect(this.chunk.getBlock(new THREE.Vector3())).to.equal(undefined);
		});

		it("removeBlock(VoxelBlock)", function() {
			this.chunk.removeBlock(this.block);
			expect(this.chunk.hasBlock(this.block)).to.equal(false);
			expect(this.chunk.getBlock(this.block)).to.equal(undefined);
		});
	});

	describe("clearBlocks", function() {
		before(function() {
			this.chunk.createBlock("block", new THREE.Vector3());
			this.chunk.clearBlocks();
		});

		it("removes all blocks in chunk", function() {
			expect(this.chunk.getBlock(new THREE.Vector3())).to.equal(undefined);
		});
	});

	describe("chunkSize", function() {
		it("returns THREE.Vector3", function() {
			expect(this.chunk.chunkSize).to.be.an.instanceOf(THREE.Vector3);
		});
		it("returns empty vector if the chunk dose not have a map", function() {
			let pos = this.chunkPosition;
			this.map.removeChunk(this.chunk);
			expect(this.chunk.chunkSize.equals(new THREE.Vector3())).to.equal(true);
			this.map.setChunk(this.chunk, pos);
		});
	});
});
