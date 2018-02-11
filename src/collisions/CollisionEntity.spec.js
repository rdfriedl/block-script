import * as THREE from "three";
import CollisionEntity from "./CollisionEntity.js";

describe("CollisionEntity", function() {
	before(function() {
		this.entity = new CollisionEntity();
	});

	it('"position" is Vec3', function() {
		expect(this.entity.position).to.be.an.instanceOf(THREE.Vector3);
	});

	it('"velocity" is Vec3', function() {
		expect(this.entity.velocity).to.be.an.instanceOf(THREE.Vector3);
	});
});
