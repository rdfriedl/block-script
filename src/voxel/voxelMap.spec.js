import THREE from "three";
import VoxelMap from "./VoxelMap.js";
import VoxelChunk from "./VoxelChunk.js";
import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";

/** @test {VoxelMap} */
describe("VoxelMap", () => {
	let map, chunk;

	beforeEach(() => {
		map = new VoxelMap(new VoxelBlockManager());

		// register default block
		map.blockManager.registerBlock(VoxelBlock);
	});

	it("is an instance of THREE.Group", () => {
		expect(map).to.be.an.instanceOf(THREE.Group);
	});

	it("blockSize is a THREE.Vector3", () => {
		expect(map.blockSize).not.to.be.undefined;
		expect(map.blockSize).to.be.an.instanceOf(THREE.Vector3);
	});

	it("chunkSize is a THREE.Vector3", () => {
		expect(map.chunkSize).not.to.be.undefined;
		expect(map.chunkSize).to.be.an.instanceOf(THREE.Vector3);
	});

	describe("blockManager", () => {
		it("should be an instanceof VoxelBlockManager", () => {
			expect(map.blockManager).to.be.an.instanceOf(VoxelBlockManager);
		});
	});

	/** @test {VoxelMap#createChunk} */
	describe("createChunk", () => {
		beforeEach(() => {
			chunk = map.createChunk(new THREE.Vector3());
		});

		it("returns a new VoxelChunk", () => {
			expect(chunk).to.be.an.instanceOf(VoxelChunk);
		});

		it("add the chunk to the map", () => {
			expect(map.getChunk(new THREE.Vector3())).to.equal(chunk);
		});
	});

	/** @test {VoxelMap#setChunk} */
	describe("setChunk", () => {
		beforeEach(() => {
			chunk = new VoxelChunk();
		});

		it("add the chunk to the map", () => {
			map.setChunk(chunk, new THREE.Vector3());

			expect(map.getChunk(new THREE.Vector3())).to.equal(chunk);
		});

		it("should set the 'map' property on the chunk", () => {
			map.setChunk(chunk, new THREE.Vector3());

			chunk.map.should.equal(map);
		});

		it('should emit the "chunk:set" event', () => {
			let listener = sinon.stub().callsFake(event => {
				event.chunk.should.equal(chunk);
			});

			map.addEventListener("chunk:set", listener);

			map.setChunk(chunk, new THREE.Vector3());

			listener.should.have.been.called;
		});
	});

	/** @test {VoxelMap#hasChunk} */
	describe("hasChunk", () => {
		beforeEach(() => {
			chunk = map.createChunk(new THREE.Vector3());
		});

		it("hasChunk(THREE.Vector3)", () => {
			expect(map.hasChunk(new THREE.Vector3(0, 0, 0))).to.be.true;
		});

		it('hasChunk("x,y,z")', () => {
			expect(map.hasChunk(new THREE.Vector3())).to.be.true;
		});

		it("hasChunk(VoxelChunk)", () => {
			expect(map.hasChunk(chunk)).to.be.true;
		});
	});

	/** @test {VoxelMap#getChunk} */
	describe("getChunk", () => {
		beforeEach(() => {
			chunk = map.createChunk(new THREE.Vector3());
		});

		describe("getChunk(THREE.Vector3)", () => {
			it("returns chunk at that position", () => {
				expect(map.getChunk(new THREE.Vector3(0, 0, 0))).to.equal(chunk);
			});
		});

		describe('getChunk("x,y,z")', () => {
			it("returns chunk at that position", () => {
				expect(map.getChunk(new THREE.Vector3())).to.equal(chunk);
			});
		});

		describe("getChunk(VoxelChunk)", () => {
			it("returns the chunk if its in this map", () => {
				expect(map.getChunk(chunk)).to.equal(chunk);
			});

			it("returns undefined it the map dose not have the chunk", () => {
				expect(map.getChunk(new VoxelChunk())).to.be.undefined;
			});
		});
	});

	/** @test {VoxelMap#removeChunk} */
	describe("removeChunk", () => {
		beforeEach(() => {
			chunk = map.createChunk(new THREE.Vector3());
		});

		it("(THREE.Vector3)", () => {
			let vec = new THREE.Vector3(0, 0, 0);
			map.removeChunk(vec);
			expect(map.hasChunk(vec)).to.be.false;
			expect(map.getChunk(vec)).to.be.undefined;
		});

		it('("x,y,z")', () => {
			map.removeChunk(new THREE.Vector3());
			expect(map.hasChunk(new THREE.Vector3())).to.be.false;
			expect(map.getChunk(new THREE.Vector3())).to.be.undefined;
		});

		it("(VoxelChunk)", () => {
			map.removeChunk(chunk);
			expect(map.hasChunk(chunk)).to.be.false;
			expect(map.getChunk(chunk)).to.be.undefined;
		});

		it('should emit the "chunk:removed" event', () => {
			let listener = sinon.stub().callsFake(event => {
				event.chunk.should.equal(chunk);
			});

			map.addEventListener("chunk:removed", listener);
			map.removeChunk(chunk);

			listener.should.have.been.called;
		});

		it('should reset the chunks "map" property', () => {
			map.removeChunk(chunk);

			expect(chunk.map).to.be.undefined;
		});

		it("should reset the chunks position", () => {
			map.removeChunk(chunk);

			chunk.position.equals(new THREE.Vector3()).should.be.true;
		});
	});

	describe("clearChunks", () => {
		it("removes all chunks in map", () => {
			map.createChunk(new THREE.Vector3());
			map.clearChunks();
			expect(map.listChunks().length).to.equal(0);
		});
	});

	describe("getChunkPosition", () => {
		beforeEach(() => {
			chunk = map.createChunk(new THREE.Vector3());
		});

		it("returns the position of the chunk", () => {
			expect(map.getChunkPosition(chunk).equals(new THREE.Vector3(0, 0, 0))).to.be.true;
		});

		it("returns undefined if the chunk is not in the map", () => {
			expect(map.getChunkPosition(new VoxelChunk())).to.be.undefined;
		});
	});

	describe("listChunks", () => {
		it("returns array of chunks", () => {
			map.clearChunks();
			map.createChunk(new THREE.Vector3());
			map.createChunk(new THREE.Vector3(0, 1, 0));
			map.createChunk(new THREE.Vector3(0, 2, 0));
			expect(map.listChunks().length).to.equal(3);
		});
	});

	// blocks
	describe("createBlock", () => {
		it("returns created block", () => {
			expect(map.createBlock("block", new THREE.Vector3(1, 1, 1))).to.be.an.instanceOf(VoxelBlock);
		});

		it("creates a block at position", () => {
			let block = map.createBlock("block", new THREE.Vector3());
			expect(map.getBlock(new THREE.Vector3())).to.equal(block);
		});
	});

	describe("hasBlock", () => {
		let block;

		beforeEach(() => {
			block = map.createBlock("block", new THREE.Vector3());
		});

		it("hasBlock(THREE.Vector3)", () => {
			expect(map.hasBlock(new THREE.Vector3(0, 0, 0))).to.be.true;
		});

		it('hasBlock("x,y,z")', () => {
			expect(map.hasBlock(new THREE.Vector3())).to.be.true;
		});

		it("hasBlock(VoxelBlock)", () => {
			expect(map.hasBlock(block)).to.be.true;
		});
	});

	describe("getBlock", () => {
		let block;

		beforeEach(() => {
			block = map.createBlock("block", new THREE.Vector3());
		});

		it("getBlock(THREE.Vector3)", () => {
			expect(map.getBlock(new THREE.Vector3(0, 0, 0))).to.equal(block);
		});

		it('getBlock("x,y,z")', () => {
			expect(map.getBlock(new THREE.Vector3())).to.equal(block);
		});

		describe("getBlock(VoxelBlock)", () => {
			it("returns block if its in the map", () => {
				expect(map.getBlock(block)).to.equal(block);
			});

			it("returns undefined if the block in not in the map", () => {
				expect(map.getBlock(new VoxelBlock())).to.be.undefined;
			});
		});
	});

	describe("removeBlock", () => {
		let block;

		beforeEach(() => {
			block = map.createBlock(new THREE.Vector3());
		});

		it("removeBlock(THREE.Vector3)", () => {
			let vec = new THREE.Vector3(0, 0, 0);
			map.removeBlock(vec);
			expect(map.hasBlock(vec)).to.be.false;
			expect(map.getBlock(vec)).to.be.undefined;
		});

		it('removeBlock("x,y,z")', () => {
			map.removeBlock(new THREE.Vector3());
			expect(map.hasBlock(new THREE.Vector3())).to.be.false;
			expect(map.getBlock(new THREE.Vector3())).to.be.undefined;
		});

		it("removeBlock(VoxelBlock)", () => {
			map.removeBlock(block);
			expect(map.hasBlock(block)).to.be.false;
			expect(map.getBlock(block)).to.be.undefined;
		});
	});

	describe("clearBlocks", () => {
		beforeEach(() => {
			map.createBlock("block", new THREE.Vector3());
			map.clearBlocks();
		});

		it("removes all blocks in map", () => {
			expect(map.getBlock(new THREE.Vector3())).to.be.undefined;
		});

		it("keeps the chunks", () => {
			expect(map.listChunks().length).to.be.above(0);
		});
	});

	/** @test {VoxelMap#toJSON} */
	describe("toJSON", () => {
		it('should return an object with a "chunks" array', () => {
			let json = map.toJSON();

			json.chunks.should.be.an("array");
		});
	});

	/** @test {VoxelMap#fromJSON} */
	describe("fromJSON", () => {
		it("should create a chunk in the map", () => {
			let json = {
				chunks: [
					[
						"1,1,1",
						{
							blocks: [],
							types: [],
						},
					],
				],
			};

			map.fromJSON(json);

			expect(map.getChunk(new THREE.Vector3(1, 1, 1))).to.be.an.instanceOf(VoxelChunk);
		});
	});
});
