import THREE from 'three';
import CollisionEntity from '../../src/js/collisions/CollisionEntity.js';
import CollisionShape from '../../src/js/collisions/CollisionShape.js';

describe('CollisionEntity', function() {
	beforeAll(function(){
		this.entity = new CollisionEntity();
	})

	it('"position" is Vec3', function() {
		expect(this.entity.position instanceof THREE.Vector3).toBe(true);
	});

	it('"velocity" is Vec3', function() {
		expect(this.entity.velocity instanceof THREE.Vector3).toBe(true);
	});
});
