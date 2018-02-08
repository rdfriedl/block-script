import THREE from "three";
import MazeGenerator from "./MazeGenerator.js";

describe("MazeGenerator", function() {
	beforeAll(function() {
		this.generator = new MazeGenerator(
			THREE.Vector4,
			new THREE.Vector4(10, 10, 10, 10),
		);
	});

	it("get and set cell data", function() {
		let cell = new THREE.Vector4(0, 0, 0, 0);
		this.generator.setCell(new THREE.Vector4(0, 0, 0, 0), cell);
		expect(this.generator.getCell(new THREE.Vector4(0, 0, 0, 0))).toBe(cell);
	});

	describe("checkPosition", function() {
		it("returns false if position is outside of maze", function() {
			expect(this.generator.checkPosition(new THREE.Vector4(-1, 0, 0, 0))).toBe(
				false,
			);
			expect(this.generator.checkPosition(new THREE.Vector4(0, -1, 0, 0))).toBe(
				false,
			);
			expect(
				this.generator.checkPosition(new THREE.Vector4(0, 0, 100, 0)),
			).toBe(false);
			expect(
				this.generator.checkPosition(new THREE.Vector4(0, -2, 100, 0)),
			).toBe(false);
			expect(this.generator.checkPosition(new THREE.Vector4(5, 5, 5, 0))).toBe(
				true,
			);
		});
	});

	describe("createCell", function() {
		it("returns cell", function() {
			expect(
				this.generator.createCell(new THREE.Vector4(5, 5, 5, 5)),
			).toBeDefined();
		});

		it('returns "undefined" if "position" is out of maze', function() {
			expect(this.generator.createCell(new THREE.Vector4(5, -50, 5, 500))).toBe(
				undefined,
			);
		});

		it("sets cell", function() {
			let cell = this.generator.createCell(new THREE.Vector4(5, 3, 5, 2));
			expect(this.generator.getCell(new THREE.Vector4(5, 3, 5, 2))).toBe(cell);
		});
	});

	describe("setCell", function() {
		it("sets cell", function() {
			let cell = new THREE.Vector4(0, 0, 0, 0);
			this.generator.setCell(new THREE.Vector4(0, 0, 0, 0), cell);
			expect(this.generator.cells["0,0,0,0"]).toBe(cell);
		});
	});

	describe("getCell", function() {
		it("returns cell", function() {
			let cell = this.generator.createCell(new THREE.Vector4(7, 3, 5, 2));
			expect(this.generator.getCell(new THREE.Vector4(7, 3, 5, 2))).toBe(cell);
		});

		it('returns "undefined" if "position" is outside of maze', function() {
			this.generator.createCell(new THREE.Vector4(7, 3, 50, 3));
			expect(this.generator.getCell(new THREE.Vector4(7, 3, 50, 3))).toBe(
				undefined,
			);
		});
	});
});