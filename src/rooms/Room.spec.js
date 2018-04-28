import { Vector4 } from "three";
import DefaultRooms from "../rooms.js";

/** @test {Room} */
describe("Room", () => {
	let room;

	before(() => {
		room = DefaultRooms.createRoom({
			doors: new Vector4(1, 0, 1, 0),
			rotate: false
		});
	});

	describe("doors", () => {
		it("returns Vector4", () => {
			expect(room.doors).to.be.an.instanceOf(Vector4);
			expect(room.doors.equals(new Vector4(1, 0, 1, 0))).to.equal(true);
		});

		it("has rotation applied", () => {
			room.rotation = 2;
			expect(room.doors.equals(new Vector4(2, 0, 2, 0))).to.equal(true);
			room.rotation = 1;
			expect(room.doors.equals(new Vector4(1, 0, 2, 0))).to.equal(true);
			room.rotation = -1;
			expect(room.doors.equals(new Vector4(2, 0, 1, 0))).to.equal(true);
		});
	});
});
