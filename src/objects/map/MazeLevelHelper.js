import { Group, Vector3, Vector4 } from "three";
import RoomHelper from "./RoomHelper.js";

export default class MazeLevelHelper extends Group {
	constructor(roomMaze) {
		super();

		this.level = 0;
		this.time = 0;
		this.rooms = roomMaze;
		this.roomSize = new Vector3().copy(this.rooms.roomSize);

		this.helpers = {};

		this.update();
	}

	update() {
		let mazeSize = this.rooms.size;

		// create the objects for the rooms
		let pos = new Vector4();
		for (let x = 0; x < mazeSize.x; x++) {
			for (let z = 0; z < mazeSize.z; z++) {
				pos.set(x, this.level, z, this.time);

				let room = this.rooms.getRoom(pos);
				if (!room) continue;

				let helper = this.helpers[x + "-" + z];
				if (!helper) {
					// create mesh
					helper = new RoomHelper();
					this.helpers[x + "-" + z] = helper;
					this.add(helper);
				}

				helper.room = room;
				helper.roomSize.copy(this.roomSize);
				helper.position.copy(room.position).multiply(this.roomSize).setY(0);
				helper.update();
			}
		}
	}
}
