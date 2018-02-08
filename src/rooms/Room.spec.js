import THREE from "three";
import DefaultRooms from "../rooms.js";

describe("Room", function() {
	beforeAll(function() {
		this.room = DefaultRooms.createRoom({
			doors: new THREE.Vector4(1, 0, 1, 0),
			rotate: false,
		});
	});
	describe("doors", function() {
		it("returns Vector4", function() {
			expect(this.room.doors instanceof THREE.Vector4).toBe(true);
			expect(this.room.doors.equals(new THREE.Vector4(1, 0, 1, 0))).toBe(true);
		});

		it("has rotation applied", function() {
			this.room.rotation = 2;
			expect(this.room.doors.equals(new THREE.Vector4(2, 0, 2, 0))).toBe(true);
			this.room.rotation = 1;
			expect(this.room.doors.equals(new THREE.Vector4(1, 0, 2, 0))).toBe(true);
			this.room.rotation = -1;
			expect(this.room.doors.equals(new THREE.Vector4(2, 0, 1, 0))).toBe(true);
		});
	});
});
