import THREE from 'three';
import Room from '../../rooms/Room.js';
import 'imports?THREE=three!../../../lib/THREE.MeshLine.js';

export default class RoomHelper extends THREE.Group{
	constructor(room){
		super();

		this.room = room;
		this.roomSize = new THREE.Vector3();

		if(this.room)
			this.roomSize.copy(this.room.size);

		this.RoomColor = new THREE.Color(0x222222);
		this.DoorColors = {
			x: new THREE.Color(0x2222ff),
			z: new THREE.Color(0x2222ff),
			y: new THREE.Color(0x225522),
			w: new THREE.Color(0xDCE15A)
		};

		//create the geometry
		this.border = new THREE.BoxHelper(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(1,1,1)), this.RoomColor);
		this.add(this.border);

		// create doors group
		this.doors = new THREE.Group();
		this.add(this.doors);

		// create and update the doors
		this.update();
	}

	update(){
		if(!this.room)
			return;

		let halfRoom = this.roomSize.clone().divideScalar(2);

		// update doors on x, y, z axes
		['x','y','z'].forEach(axis => {
			let geometry = new THREE.Geometry();
			let material = new THREE.MeshLineMaterial({
				lineWidth: 0.3,
				color: this.DoorColors[axis],
				resolution: new THREE.Vector3(window.innerWidth, window.innerHeight),
				sizeAttenuation: true,
				near: 1,
				far: 10000
			});

			if((this.room.doors[axis] & Room.DOOR_POSITIVE) && (this.room.doors[axis] & Room.DOOR_NEGATIVE)){
				let start = halfRoom.clone();
				start[axis] -= halfRoom[axis];
				geometry.vertices.push(start);

				let end = halfRoom.clone();
				end[axis] += halfRoom[axis];
				geometry.vertices.push(end);
			}
			else if(this.room.doors[axis] & Room.DOOR_POSITIVE){
				geometry.vertices.push(halfRoom.clone());

				let end = halfRoom.clone();
				end[axis] += halfRoom[axis];
				geometry.vertices.push(end);
			}
			else if(this.room.doors[axis] & Room.DOOR_NEGATIVE){
				geometry.vertices.push(halfRoom.clone());

				let end = halfRoom.clone();
				end[axis] -= halfRoom[axis];
				geometry.vertices.push(end);
			}

			let line = new THREE.MeshLine();
			line.setGeometry(geometry);
			let mesh = new THREE.Mesh(line.geometry, material);
			this.doors.add(mesh);
		})

		// set the border color
		this.border.material.color.copy(this.RoomColor);

		// update bounding box
		let roomBox = new THREE.Box3(new THREE.Vector3(), this.roomSize);
		this.border.update(roomBox);
	}
}
