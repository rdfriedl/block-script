import { Vector3 } from "three";
import MazeGenerator from "./MazeGenerator.js";

/** @test {MazeGenerator} */
describe("MazeGenerator", function() {
	before(function() {
		this.generator = new MazeGenerator(Vector3, new Vector3(10, 10, 10));
	});

	it("get and set cell data", function() {
		let cell = new Vector3();
		this.generator.setCell(new Vector3(), cell);
		expect(this.generator.getCell(new Vector3())).to.equal(cell);
	});

	describe("checkPosition", function() {
		it("returns false if position is outside of maze", function() {
			expect(this.generator.checkPosition(new Vector3(-1, 0, 0))).to.be.false;
			expect(this.generator.checkPosition(new Vector3(0, -1, 0))).to.be.false;
			expect(this.generator.checkPosition(new Vector3(0, 0, 100))).to.be.false;
			expect(this.generator.checkPosition(new Vector3(0, -2, 100))).to.be.false;
			expect(this.generator.checkPosition(new Vector3(5, 5, 5))).to.be.true;
		});
	});

	describe("createCell", function() {
		it("returns cell", function() {
			expect(this.generator.createCell(new Vector3(5, 5, 5))).not.to.be.undefined;
		});

		it('returns "undefined" if "position" is out of maze', function() {
			expect(this.generator.createCell(new Vector3(5, -50, 5))).to.be.undefined;
		});

		it("sets cell", function() {
			let cell = this.generator.createCell(new Vector3(5, 3, 5));
			expect(this.generator.getCell(new Vector3(5, 3, 5, 2))).to.equal(cell);
		});
	});

	describe("setCell", function() {
		it("sets cell", function() {
			let cell = new Vector3();
			this.generator.setCell(new Vector3(), cell);
			expect(this.generator.cells["0,0,0"]).to.equal(cell);
		});
	});

	describe("getCell", function() {
		it("returns cell", function() {
			let cell = this.generator.createCell(new Vector3(7, 3, 5));
			expect(this.generator.getCell(new Vector3(7, 3, 5))).to.equal(cell);
		});

		it('returns "undefined" if "position" is outside of maze', function() {
			this.generator.createCell(new Vector3(7, 3, 50));
			expect(this.generator.getCell(new Vector3(7, 3, 50))).to.be.undefined;
		});
	});
});
