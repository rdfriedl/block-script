import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import * as blocks from "../blocks/defaultBlocks.js";

/** @test {VoxelBlockManager} */
describe("VoxelBlockManager", () => {
	let manager;

	beforeEach(() => {
		manager = new VoxelBlockManager();
		manager.registerBlock(blocks);
	});

	describe("hasBlock", () => {
		it("(String)", () => {
			expect(manager.hasBlock("dirt")).to.be.true;
		});
	});

	describe("getBlock", () => {
		it("(String)", () => {
			expect(manager.getBlock("dirt")).to.equal(blocks.Dirt);
		});

		it("(Class)", () => {
			expect(manager.getBlock(blocks.Dirt)).to.equal(blocks.Dirt);
		});

		it("(VoxelBlock)", () => {
			expect(manager.getBlock(new blocks.Dirt())).to.equal(blocks.Dirt);
		});

		it("(String with props)", () => {
			expect(manager.getBlock("dirt?type=test")).to.equal(blocks.Dirt);
		});
	});

	describe("createBlock", () => {
		it("(String)", () => {
			expect(manager.createBlock("dirt")).to.be.an.instanceOf(VoxelBlock);
		});

		it("(Class)", () => {
			expect(manager.createBlock(blocks.Dirt)).to.be.an.instanceOf(VoxelBlock);
		});

		it("(VoxelBlock)", () => {
			expect(manager.createBlock(new blocks.Dirt())).to.be.an.instanceOf(VoxelBlock);
		});

		it("returns undefined if the manager dose not have the block", () => {
			expect(manager.createBlock("non-existent-block")).to.be.undefined;
		});

		it("get block from pool if pool is enabled", () => {
			manager.usePool = true;
			// add block to the pool
			let oldBlock = new blocks.Dirt();
			manager.disposeBlock(oldBlock);

			let block = manager.createBlock("dirt");

			expect(block).to.equal(oldBlock);
			expect(block).to.be.an.instanceOf(VoxelBlock);

			manager.usePool = false;
		});

		it("sets props", () => {
			let block;

			// with pool
			manager.usePool = true;
			manager.disposeBlock(new blocks.Dirt());
			block = manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).to.equal("test");

			// without pool
			manager.usePool = false;
			block = manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).to.equal("test");
		});

		it("(String with props)", () => {
			let block = manager.createBlock("dirt?type=test");
			expect(block.getProp("type")).to.equal("test");
		});
	});

	/** @test {VoxelBlockManager#resolveID} */
	describe("resolveID", () => {
		it("(String)", () => {
			expect(VoxelBlockManager.resolveID("dirt")).to.equal("dirt");
		});

		it("(string with props)", () => {
			expect(VoxelBlockManager.resolveID("dirt?type=test")).to.equal("dirt");
		});

		it("(Class)", () => {
			expect(VoxelBlockManager.resolveID(blocks.Dirt)).to.equal("dirt");
		});

		it("(VoxelBlock)", () => {
			expect(VoxelBlockManager.resolveID(new blocks.Dirt())).to.equal("dirt");
		});
	});

	/** @test {VoxelBlockManager#createID} */
	describe("createID", () => {
		it("(String, Object)", () => {
			expect(VoxelBlockManager.createID("dirt", { type: "test" })).to.equal("dirt?type=test");
			expect(VoxelBlockManager.createID("dirt", { type: "test", another: 9 })).to.equal("dirt?type=test&another=9");
		});

		it("(VoxelBlock, Object)", () => {
			expect(VoxelBlockManager.createID(new blocks.Dirt(), { type: "test" })).to.equal("dirt?type=test");
			expect(
				VoxelBlockManager.createID(new blocks.Dirt(), {
					type: "test",
					another: 9
				})
			).to.equal("dirt?type=test&another=9");
		});

		it("(VoxelBlock with props, Object", () => {
			expect(VoxelBlockManager.createID(manager.createBlock("dirt", { type: "normal" }), { type2: "test" })).to.equal(
				"dirt?type2=test&type=normal"
			);
			expect(
				VoxelBlockManager.createID(manager.createBlock("dirt", { type: "normal" }), { type2: "test", another: 9 })
			).to.equal("dirt?type2=test&another=9&type=normal");
		});
	});
});
