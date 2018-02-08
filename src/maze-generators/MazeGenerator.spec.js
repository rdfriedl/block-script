import THREE from "three";
import MazeGenerator from "./MazeGenerator.js";

describe("MazeGenerator", function() {
	before(function() {
		this.generator = new MazeGenerator(
			THREE.Vector4,
			new THREE.Vector4(10, 10, 10, 10),
		);
	});

	it("get and set cell data", function() {
		let cell = new THREE.Vector4(0, 0, 0, 0);
		this.generator.setCell(new THREE.Vector4(0, 0, 0, 0), cell);
		expect(this.generator.getCell(new THREE.Vector4(0, 0, 0, 0))).to.equal(
			cell,
		);
	});

	describe("checkPosition", function() {
		it("returns false if position is outside of maze", function() {
			expect(
				this.generator.checkPosition(new THREE.Vector4(-1, 0, 0, 0)),
			).to.equal(false);
			expect(
				this.generator.checkPosition(new THREE.Vector4(0, -1, 0, 0)),
			).to.equal(false);
			expect(
				this.generator.checkPosition(new THREE.Vector4(0, 0, 100, 0)),
			).to.equal(false);
			expect(
				this.generator.checkPosition(new THREE.Vector4(0, -2, 100, 0)),
			).to.equal(false);
			expect(
				this.generator.checkPosition(new THREE.Vector4(5, 5, 5, 0)),
			).to.equal(true);
		});
	});

	describe("createCell", function() {
		it("returns cell", function() {
			expect(this.generator.createCell(new THREE.Vector4(5, 5, 5, 5))).not.to.be
				.undefined;
		});

		it('returns "undefined" if "position" is out of maze', function() {
			expect(
				this.generator.createCell(new THREE.Vector4(5, -50, 5, 500)),
			).to.equal(undefined);
		});

		it("sets cell", function() {
			let cell = this.generator.createCell(new THREE.Vector4(5, 3, 5, 2));
			expect(this.generator.getCell(new THREE.Vector4(5, 3, 5, 2))).to.equal(
				cell,
			);
		});
	});

	describe("setCell", function() {
		it("sets cell", function() {
			let cell = new THREE.Vector4(0, 0, 0, 0);
			this.generator.setCell(new THREE.Vector4(0, 0, 0, 0), cell);
			expect(this.generator.cells["0,0,0,0"]).to.equal(cell);
		});
	});

	describe("getCell", function() {
		it("returns cell", function() {
			let cell = this.generator.createCell(new THREE.Vector4(7, 3, 5, 2));
			expect(this.generator.getCell(new THREE.Vector4(7, 3, 5, 2))).to.equal(
				cell,
			);
		});

		it('returns "undefined" if "position" is outside of maze', function() {
			this.generator.createCell(new THREE.Vector4(7, 3, 50, 3));
			expect(this.generator.getCell(new THREE.Vector4(7, 3, 50, 3))).to.equal(
				undefined,
			);
		});
	});
});
