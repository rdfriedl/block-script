import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import THREE from "three";

/** @test {VoxelMap} */
describe("VoxelMap", function() {
	before(function() {
		this.map = new VoxelMap();

		// register default block
		this.map.blockManager.registerBlock(VoxelBlock);
	});

	it("is an instance of THREE.Group", function() {
		expect(this.map).to.be.an.instanceOf(THREE.Group);
	});

	it("blockSize is a THREE.Vector3", function() {
		expect(this.map.blockSize).not.to.be.undefined;
		expect(this.map.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkSize is a THREE.Vector3", function() {
		expect(this.map.chunkSize).not.to.be.undefined;
		expect(this.map.chunkSize).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("blockManager", function() {
		it("instanceof VoxelBlockManager", function() {
			expect(this.map.blockManager).to.be.an.instanceOf(VoxelBlockManager);
		});
	});

	// chunks
	describe("createChunk", function() {
		before(function() {
			this.chunk = this.map.createChunk(new THREE.Vector3());
		});

		it("returns a new VoxelChunk", function() {
			expect(this.chunk).to.be.an.instanceOf(VoxelChunk);
		});

		it("add the chunk to the map", function() {
			expect(this.map.getChunk(new THREE.Vector3())).to.equal(this.chunk);
		});
	});

	describe("hasChunk", function() {
		before(function() {
			this.chunk = this.map.createChunk(new THREE.Vector3());
		});

		it("hasChunk(THREE.Vector3)", function() {
			expect(this.map.hasChunk(new THREE.Vector3(0, 0, 0))).to.equal(true);
		});

		it('hasChunk("x,y,z")', function() {
			expect(this.map.hasChunk(new THREE.Vector3())).to.equal(true);
		});

		it("hasChunk(VoxelChunk)", function() {
			expect(this.map.hasChunk(this.chunk)).to.equal(true);
		});
	});

	describe("getChunk", function() {
		before(function() {
			this.chunk = this.map.createChunk(new THREE.Vector3());
		});

		describe("getChunk(THREE.Vector3)", function() {
			it("returns chunk at that position", function() {
				expect(this.map.getChunk(new THREE.Vector3(0, 0, 0))).to.equal(
					this.chunk,
				);
			});
		});

		describe('getChunk("x,y,z")', function() {
			it("returns chunk at that position", function() {
				expect(this.map.getChunk(new THREE.Vector3())).to.equal(this.chunk);
			});
		});

		describe("getChunk(VoxelChunk)", function() {
			it("returns the chunk if its in this map", function() {
				expect(this.map.getChunk(this.chunk)).to.equal(this.chunk);
			});

			it("returns undefined it the map dose not have the chunk", function() {
				expect(this.map.getChunk(new VoxelChunk())).to.equal(undefined);
			});
		});
	});

	describe("removeChunk", function() {
		beforeEach(function() {
			this.chunk = this.map.createChunk(new THREE.Vector3());
		});

		it("removeChunk(THREE.Vector3)", function() {
			let vec = new THREE.Vector3(0, 0, 0);
			this.map.removeChunk(vec);
			expect(this.map.hasChunk(vec)).to.equal(false);
			expect(this.map.getChunk(vec)).to.equal(undefined);
		});

		it('removeChunk("x,y,z")', function() {
			this.map.removeChunk(new THREE.Vector3());
			expect(this.map.hasChunk(new THREE.Vector3())).to.equal(false);
			expect(this.map.getChunk(new THREE.Vector3())).to.equal(undefined);
		});

		it("removeChunk(VoxelChunk)", function() {
			this.map.removeChunk(this.chunk);
			expect(this.map.hasChunk(this.chunk)).to.equal(false);
			expect(this.map.getChunk(this.chunk)).to.equal(undefined);
		});
	});

	describe("clearChunks", function() {
		it("removes all chunks in map", function() {
			this.map.createChunk(new THREE.Vector3());
			this.map.clearChunks();
			expect(this.map.listChunks().length).to.equal(0);
		});
	});

	describe("getChunkPosition", function() {
		before(function() {
			this.chunk = this.map.createChunk(new THREE.Vector3());
		});

		it("returns the position of the chunk", function() {
			expect(
				this.map
					.getChunkPosition(this.chunk)
					.equals(new THREE.Vector3(0, 0, 0)),
			).to.equal(true);
		});

		it("returns undefined if the chunk is not in the map", function() {
			expect(this.map.getChunkPosition(new VoxelChunk())).to.equal(undefined);
		});
	});

	describe("listChunks", function() {
		it("returns array of chunks", function() {
			this.map.clearChunks();
			this.map.createChunk(new THREE.Vector3());
			this.map.createChunk(new THREE.Vector3(0, 1, 0));
			this.map.createChunk(new THREE.Vector3(0, 2, 0));
			expect(this.map.listChunks().length).to.equal(3);
		});
	});

	// blocks
	describe("createBlock", function() {
		it("returns created block", function() {
			expect(
				this.map.createBlock("block", new THREE.Vector3(1, 1, 1)) instanceof
					VoxelBlock,
			).to.equal(true);
		});

		it("creates a block at position", function() {
			let block = this.map.createBlock("block", new THREE.Vector3());
			expect(this.map.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("hasBlock", function() {
		before(function() {
			this.block = this.map.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", function() {
			expect(this.map.hasBlock(new THREE.Vector3(0, 0, 0))).to.equal(true);
		});

		it('hasBlock("x,y,z")', function() {
			expect(this.map.hasBlock(new THREE.Vector3())).to.equal(true);
		});

		it("hasBlock(VoxelBlock)", function() {
			expect(this.map.hasBlock(this.block)).to.equal(true);
		});
	});

	describe("getBlock", function() {
		before(function() {
			this.block = this.map.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", function() {
			expect(this.map.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(
				this.block,
			);
		});

		it('getBlock("x,y,z")', function() {
			expect(this.map.getBlock(new THREE.Vector3())).to.equal(this.block);
		});

		describe("getBlock(VoxelBlock)", function() {
			it("returns block if its in the map", function() {
				expect(this.map.getBlock(this.block)).to.equal(this.block);
			});

			it("returns undefined if the block in not in the map", function() {
				expect(this.map.getBlock(new VoxelBlock())).to.equal(undefined);
			});
		});
	});

	describe("removeBlock", function() {
		beforeEach(function() {
			this.block = this.map.createBlock(new THREE.Vector3());
		});

		it("removeBlock(THREE.Vector3)", function() {
			let vec = new THREE.Vector3(0, 0, 0);
			this.map.removeBlock(vec);
			expect(this.map.hasBlock(vec)).to.equal(false);
			expect(this.map.getBlock(vec)).to.equal(undefined);
		});

		it('removeBlock("x,y,z")', function() {
			this.map.removeBlock(new THREE.Vector3());
			expect(this.map.hasBlock(new THREE.Vector3())).to.equal(false);
			expect(this.map.getBlock(new THREE.Vector3())).to.equal(undefined);
		});

		it("removeBlock(VoxelBlock)", function() {
			this.map.removeBlock(this.block);
			expect(this.map.hasBlock(this.block)).to.equal(false);
			expect(this.map.getBlock(this.block)).to.equal(undefined);
		});
	});

	describe("clearBlocks", function() {
		before(function() {
			this.map.createBlock("block", new THREE.Vector3());
			this.map.clearBlocks();
		});

		it("removes all blocks in map", function() {
			expect(this.map.getBlock(new THREE.Vector3())).to.equal(undefined);
		});

		it("keeps the chunks", function() {
			expect(this.map.listChunks().length).to.be.above(0);
		});
	});
});
