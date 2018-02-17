import * as THREE from "three";
import DefaultRooms from "../rooms.js";

/** @test {Room} */
describe("Room", function() {
	before(function() {
		this.room = DefaultRooms.createRoom({
			doors: new THREE.Vector4(1, 0, 1, 0),
			rotate: false
		});
	});

	/** @test {Room#doors} */
	describe("doors", function() {
		it("returns Vector4", function() {
			expect(this.room.doors).to.be.an.instanceOf(THREE.Vector4);
			expect(this.room.doors.equals(new THREE.Vector4(1, 0, 1, 0))).to.equal(true);
		});

		it("has rotation applied", function() {
			this.room.rotation = 2;
			expect(this.room.doors.equals(new THREE.Vector4(2, 0, 2, 0))).to.equal(true);
			this.room.rotation = 1;
			expect(this.room.doors.equals(new THREE.Vector4(1, 0, 2, 0))).to.equal(true);
			this.room.rotation = -1;
			expect(this.room.doors.equals(new THREE.Vector4(2, 0, 1, 0))).to.equal(true);
		});
	});
});
