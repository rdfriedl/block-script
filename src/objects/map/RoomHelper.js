import { Group, Vector3, Color, BoxHelper, Geometry, Mesh, Box3 } from "three";
import Room from "../../rooms/Room.js";
import { MeshLine, MeshLineMaterial } from "three.meshline";

export default class RoomHelper extends Group {
	constructor(room) {
		super();

		this.room = room;
		this.roomSize = new Vector3();

		if (this.room) this.roomSize.copy(this.room.size);

		this.RoomColor = new Color(0x222222);
		this.DoorColors = {
			x: new Color(0x2222ff),
			z: new Color(0x2222ff),
			y: new Color(0x225522),
			w: new Color(0xdce15a)
		};

		// create the geometry
		this.border = new BoxHelper(new Box3(new Vector3(), new Vector3(1, 1, 1)), this.RoomColor);
		this.add(this.border);

		// create doors group
		this.doors = new Group();
		this.add(this.doors);

		// create and update the doors
		this.update();
	}

	update() {
		if (!this.room) return;

		let halfRoom = this.roomSize.clone().divideScalar(2);

		// update doors on x, y, z axes
		["x", "y", "z"].forEach(axis => {
			let geometry = new Geometry();
			let material = new MeshLineMaterial({
				lineWidth: 0.3,
				color: this.DoorColors[axis],
				resolution: new Vector3(window.innerWidth, window.innerHeight),
				sizeAttenuation: true,
				near: 1,
				far: 10000
			});

			if (this.room.doors[axis] & Room.DOOR_POSITIVE && this.room.doors[axis] & Room.DOOR_NEGATIVE) {
				let start = halfRoom.clone();
				start[axis] -= halfRoom[axis];
				geometry.vertices.push(start);

				let end = halfRoom.clone();
				end[axis] += halfRoom[axis];
				geometry.vertices.push(end);
			} else if (this.room.doors[axis] & Room.DOOR_POSITIVE) {
				geometry.vertices.push(halfRoom.clone());

				let end = halfRoom.clone();
				end[axis] += halfRoom[axis];
				geometry.vertices.push(end);
			} else if (this.room.doors[axis] & Room.DOOR_NEGATIVE) {
				geometry.vertices.push(halfRoom.clone());

				let end = halfRoom.clone();
				end[axis] -= halfRoom[axis];
				geometry.vertices.push(end);
			}

			let line = new MeshLine();
			line.setGeometry(geometry);
			let mesh = new Mesh(line.geometry, material);
			this.doors.add(mesh);
		});

		// set the border color
		this.border.material.color.copy(this.RoomColor);

		// update bounding box
		let roomBox = new Box3(new Vector3(), this.roomSize);
		this.border.update(roomBox);
	}
}
