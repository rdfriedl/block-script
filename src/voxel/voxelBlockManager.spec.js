import VoxelBlock from "./VoxelBlock.js";
import VoxelBlockManager from "./VoxelBlockManager.js";
import * as blocks from "../blocks/defaultBlocks.js";

/** @test {VoxelBlockManager} */
describe("VoxelBlockManager", function() {
	before(function() {
		this.manager = new VoxelBlockManager();
		this.manager.registerBlock(blocks);
	});

	describe("hasBlock", function() {
		it("hasBlock(String)", function() {
			expect(this.manager.hasBlock("dirt")).to.equal(true);
		});
	});

	describe("getBlock", function() {
		it("getBlock(String)", function() {
			expect(this.manager.getBlock("dirt")).to.equal(blocks.Dirt);
		});

		it("getBlock(Class)", function() {
			expect(this.manager.getBlock(blocks.Dirt)).to.equal(blocks.Dirt);
		});

		it("getBlock(VoxelBlock)", function() {
			expect(this.manager.getBlock(new blocks.Dirt())).to.equal(blocks.Dirt);
		});

		it("getBlock(String with props)", function() {
			expect(this.manager.getBlock("dirt?type=test")).to.equal(blocks.Dirt);
		});
	});

	describe("createBlock", function() {
		it("createBlock(String)", function() {
			expect(this.manager.createBlock("dirt")).to.be.an.instanceOf(VoxelBlock);
		});

		it("createBlock(Class)", function() {
			expect(this.manager.createBlock(blocks.Dirt)).to.be.an.instanceOf(
				VoxelBlock,
			);
		});

		it("createBlock(VoxelBlock)", function() {
			expect(this.manager.createBlock(new blocks.Dirt())).to.be.an.instanceOf(
				VoxelBlock,
			);
		});

		it("returns undefined if the manager dose not have the block", function() {
			expect(this.manager.createBlock("adfahad")).to.equal(undefined);
		});

		it("get block from pool if pool is enabled", function() {
			this.manager.usePool = true;
			// add block to the pool
			let oldBlock = new blocks.Dirt();
			this.manager.disposeBlock(oldBlock);

			let block = this.manager.createBlock("dirt");

			expect(block).to.equal(oldBlock);
			expect(block).to.be.an.instanceOf(VoxelBlock);

			this.manager.usePool = false;
		});

		it("sets props", function() {
			let block;

			// with pool
			this.manager.usePool = true;
			this.manager.disposeBlock(new blocks.Dirt());
			block = this.manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).to.equal("test");

			// without pool
			this.manager.usePool = false;
			block = this.manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).to.equal("test");
		});

		it("createBlock(String with props)", function() {
			let block = this.manager.createBlock("dirt?type=test");
			expect(block.getProp("type")).to.equal("test");
		});
	});

	describe("resolveID", function() {
		it("resolveID(String)", function() {
			expect(VoxelBlockManager.resolveID("dirt")).to.equal("dirt");
		});

		it("resolveID(string with props)", function() {
			expect(VoxelBlockManager.resolveID("dirt?type=test")).to.equal("dirt");
		});

		it("resolveID(Class)", function() {
			expect(VoxelBlockManager.resolveID(blocks.Dirt)).to.equal("dirt");
		});

		it("resolveID(VoxelBlock)", function() {
			expect(VoxelBlockManager.resolveID(new blocks.Dirt())).to.equal("dirt");
		});
	});

	describe("createID", function() {
		it("createID(String, Object)", function() {
			expect(VoxelBlockManager.createID("dirt", { type: "test" })).to.equal(
				"dirt?type=test",
			);
			expect(
				VoxelBlockManager.createID("dirt", { type: "test", another: 9 }),
			).to.equal("dirt?type=test&another=9");
		});

		it("createID(VoxelBlock, Object)", function() {
			expect(
				VoxelBlockManager.createID(new blocks.Dirt(), { type: "test" }),
			).to.equal("dirt?type=test");
			expect(
				VoxelBlockManager.createID(new blocks.Dirt(), {
					type: "test",
					another: 9,
				}),
			).to.equal("dirt?type=test&another=9");
		});

		it("createID(VoxelBlock with props, Object", function() {
			expect(
				VoxelBlockManager.createID(
					this.manager.createBlock("dirt", { type: "normal" }),
					{ type2: "test" },
				),
			).to.equal("dirt?type2=test&type=normal");
			expect(
				VoxelBlockManager.createID(
					this.manager.createBlock("dirt", { type: "normal" }),
					{ type2: "test", another: 9 },
				),
			).to.equal("dirt?type2=test&another=9&type=normal");
		});
	});
});
