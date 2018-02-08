import THREE from "three";
import Room from "../rooms/Room.js";

const DOOR_TYPES = {};
DOOR_TYPES.x = DOOR_TYPES.z = DOOR_TYPES.y = (size, side) => {
	let mesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry(4, 4, 1).translate(0, 0, 0.5),
		new THREE.MeshLambertMaterial({
			color: 0x55ff55,
			transparent: true,
			opacity: 0.3,
		}),
	);

	mesh.position
		.copy(size)
		.divideScalar(2)
		.multiply(side);
	mesh.lookAt(new THREE.Vector3());

	return mesh;
};

export default class DoorHelper extends THREE.Group {
	constructor(map, roomSize) {
		super();

		this.map = map;
		this.roomSize = new THREE.Vector3();
		this.doors = new THREE.Vector4();

		if (roomSize instanceof THREE.Vector3) this.roomSize.copy(roomSize);
	}

	update() {
		this.children = [];

		let side = new THREE.Vector3();
		for (let axis in this.doors) {
			if (!DOOR_TYPES[axis]) continue;

			if (this.doors[axis] & Room.DOOR_POSITIVE) {
				side.set(0, 0, 0)[axis] = 1;
				this.add(DOOR_TYPES[axis](this.roomSize, side));
			}
			if (this.doors[axis] & Room.DOOR_NEGATIVE) {
				side.set(0, 0, 0)[axis] = -1;
				this.add(DOOR_TYPES[axis](this.roomSize, side));
			}
		}

		return this;
	}
}
