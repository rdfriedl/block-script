import VoxelBlock from "../../src/js/voxel/VoxelBlock.js";
import VoxelBlockManager from "../../src/js/voxel/VoxelBlockManager.js";
import * as blocks from "../../src/js/blocks.js";

describe("VoxelBlockManager", function() {
	beforeAll(function() {
		this.manager = new VoxelBlockManager();
		this.manager.registerBlock(blocks);
	});

	describe("hasBlock", function() {
		it("hasBlock(String)", function() {
			expect(this.manager.hasBlock("dirt")).toBe(true);
		});
	});

	describe("getBlock", function() {
		it("getBlock(String)", function() {
			expect(this.manager.getBlock("dirt")).toBe(blocks.Dirt);
		});

		it("getBlock(Class)", function() {
			expect(this.manager.getBlock(blocks.Dirt)).toBe(blocks.Dirt);
		});

		it("getBlock(VoxelBlock)", function() {
			expect(this.manager.getBlock(new blocks.Dirt())).toBe(blocks.Dirt);
		});

		it("getBlock(String with props)", function() {
			expect(this.manager.getBlock("dirt?type=test")).toBe(blocks.Dirt);
		});
	});

	describe("createBlock", function() {
		it("createBlock(String)", function() {
			expect(this.manager.createBlock("dirt") instanceof VoxelBlock).toBe(true);
		});

		it("createBlock(Class)", function() {
			expect(this.manager.createBlock(blocks.Dirt) instanceof VoxelBlock).toBe(
				true,
			);
		});

		it("createBlock(VoxelBlock)", function() {
			expect(
				this.manager.createBlock(new blocks.Dirt()) instanceof VoxelBlock,
			).toBe(true);
		});

		it("returns undefined if the manager dose not have the block", function() {
			expect(this.manager.createBlock("adfahad")).toBe(undefined);
		});

		it("get block from pool if pool is enabled", function() {
			this.manager.usePool = true;
			// add block to the pool
			let oldBlock = new blocks.Dirt();
			this.manager.disposeBlock(oldBlock);

			let block = this.manager.createBlock("dirt");

			expect(block).toBe(oldBlock);
			expect(block instanceof VoxelBlock).toBe(true);

			this.manager.usePool = false;
		});

		it("sets props", function() {
			let block;

			// with pool
			this.manager.usePool = true;
			this.manager.disposeBlock(new blocks.Dirt());
			block = this.manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).toBe("test");

			// without pool
			this.manager.usePool = false;
			block = this.manager.createBlock("dirt", { testing: "test" });
			expect(block.getProp("testing")).toBe("test");
		});

		it("createBlock(String with props)", function() {
			let block = this.manager.createBlock("dirt?type=test");
			expect(block.getProp("type")).toBe("test");
		});
	});

	describe("resolveID", function() {
		it("resolveID(String)", function() {
			expect(VoxelBlockManager.resolveID("dirt")).toBe("dirt");
		});

		it("resolveID(string with props)", function() {
			expect(VoxelBlockManager.resolveID("dirt?type=test")).toBe("dirt");
		});

		it("resolveID(Class)", function() {
			expect(VoxelBlockManager.resolveID(blocks.Dirt)).toBe("dirt");
		});

		it("resolveID(VoxelBlock)", function() {
			expect(VoxelBlockManager.resolveID(new blocks.Dirt())).toBe("dirt");
		});
	});

	describe("createID", function() {
		it("createID(String, Object)", function() {
			expect(VoxelBlockManager.createID("dirt", { type: "test" })).toBe(
				"dirt?type=test",
			);
			expect(
				VoxelBlockManager.createID("dirt", { type: "test", another: 9 }),
			).toBe("dirt?type=test&another=9");
		});

		it("createID(VoxelBlock, Object)", function() {
			expect(
				VoxelBlockManager.createID(new blocks.Dirt(), { type: "test" }),
			).toBe("dirt?type=test");
			expect(
				VoxelBlockManager.createID(new blocks.Dirt(), {
					type: "test",
					another: 9,
				}),
			).toBe("dirt?type=test&another=9");
		});

		it("createID(VoxelBlock with props, Object", function() {
			expect(
				VoxelBlockManager.createID(
					this.manager.createBlock("dirt", { type: "normal" }),
					{ type2: "test" },
				),
			).toBe("dirt?type2=test&type=normal");
			expect(
				VoxelBlockManager.createID(
					this.manager.createBlock("dirt", { type: "normal" }),
					{ type2: "test", another: 9 },
				),
			).toBe("dirt?type2=test&another=9&type=normal");
		});
	});
});
