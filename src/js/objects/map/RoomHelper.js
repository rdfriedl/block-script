import THREE from 'three';
import Room from '../../rooms/Room.js';

export default class RoomHelper extends THREE.Group{
	constructor(room){
		super();

		this.room = room;
		this.roomSize = new THREE.Vector3();

		if(this.room)
			this.roomSize.copy(this.room.size);

		this.RoomColor = new THREE.Color(0xaaaaaa);
		this.DoorColors = {
			x: new THREE.Color(0x8888ff),
			z: new THREE.Color(0x8888ff),
			y: new THREE.Color(0x99ff99),
			w: new THREE.Color(0xDCE15A)
		};

		//create the geometry
		this.border = new THREE.BoxHelper(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(1,1,1)), this.RoomColor);
		// this.add(this.border);

		// create doors mesh
		this.doors = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
			color: 0xffffff,
			vertexColors: THREE.VertexColors
		}));
		this.add(this.doors);

		// create and update the doors
		this.update();
	}

	update(){
		if(!this.room)
			return;

		let halfRoom = this.roomSize.clone().divideScalar(2);
		let geometry = this.doors.geometry;
		geometry.vertices = [];
		geometry.colors = [];

		// update doors on x, y, z axes
		('xyz').split('').forEach(axis => {
			let color = this.DoorColors[axis];

			if(this.room.doors[axis] & Room.DOOR_POSITIVE){
				geometry.vertices.push(halfRoom.clone());
				let end = halfRoom.clone();
				end[axis] += (halfRoom[axis] * 1);
				geometry.vertices.push(end);

				// add colors
				geometry.colors.push(color, color);
			}
			if(this.room.doors[axis] & Room.DOOR_NEGATIVE){
				geometry.vertices.push(halfRoom.clone());
				let end = halfRoom.clone();
				end[axis] += (halfRoom[axis] * -1);
				geometry.vertices.push(end);

				// add colors
				geometry.colors.push(color, color);
			}
		})

		geometry.verticesNeedUpdate = true;
		geometry.colorsNeedUpdate = true;

		// update bounding box
		let roomBox = new THREE.Box3(new THREE.Vector3(), this.roomSize);
		this.border.update(roomBox);
	}
}
