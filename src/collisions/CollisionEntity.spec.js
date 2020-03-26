import { Vector3 } from "three";
import CollisionEntity from "./CollisionEntity.js";

describe("CollisionEntity", function () {
	before(function () {
		this.entity = new CollisionEntity();
	});

	it('"position" is Vector3', function () {
		expect(this.entity.position).to.be.an.instanceOf(Vector3);
	});

	it('"velocity" is Vector3', function () {
		expect(this.entity.velocity).to.be.an.instanceOf(Vector3);
	});
});
