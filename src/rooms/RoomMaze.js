import * as THREE from "three";
import Room from "./Room.js";
import RoomManager from "./RoomManager.js";
import MazeGenerator from "../maze-generators/MazeGenerator.js";

const up = new THREE.Vector3(0, 1, 0);

/** takes a {@link MazeGenerator} and a {@link RoomManager} and builds a maze out of {@link Room}s */
export default class RoomMaze {
	/**
	 * @param {MazeGenerator} mazeGenerator
	 * @param {RoomManager} [roomManager=RoomManager.inst]
	 * */
	constructor(mazeGenerator, roomManager = RoomManager.inst) {
		if (!(mazeGenerator instanceof MazeGenerator))
			throw new Error("RoomMaze requires a MazeGenerator as the first argument");

		this.generator = mazeGenerator;
		this.roomManager = roomManager;

		this.rooms = new Map();
		this.roomPositions = new WeakMap();

		this.visitedRooms = new WeakMap();

		this.tmpVec = new this.vec();

		if (!this.generator.cells) this.generator.generate();
	}

	hasRoom(pos) {
		if (pos instanceof THREE.Vector4) pos = new THREE.Vector3(pos.x, pos.y, pos.z);

		if (pos instanceof this.vec) {
			return this.rooms.has(pos.toString());
		} else if (pos instanceof Room) {
			for (let room of this.rooms) {
				if (pos === room[1]) return true;
			}
		}
		return false;
	}

	getRoom(pos) {
		if (pos instanceof THREE.Vector4) pos = new THREE.Vector3(pos.x, pos.y, pos.z);

		if (pos instanceof this.vec) {
			if (!this.hasRoom(pos)) this.createRoom(pos);

			return this.rooms.get(pos.toString());
		} else if (pos instanceof Room) {
			if (this.hasRoom(pos)) return pos;
		}
	}

	/**
	 * returns the position of the roomm in the maze
	 * @param  {Room} room
	 * @return {RoomMaze#vec}
	 */
	getRoomPosition(room) {
		return this.roomPositions.get(room) || new this.vec();
	}

	/**
	 * creates the room for the position
	 * @param {RoomMaze#vec} position
	 * @return {this}
	 * @private
	 */
	createRoom(position) {
		if (position instanceof THREE.Vector4) position = new THREE.Vector3(position.x, position.y, position.z);

		if (this.hasRoom(position)) throw new Error("cant create a room where one already exists");

		let pos = this.tmpVec.copy(position);
		let cell = this.generator.getCell(position);
		if (!cell) return this;

		let room = this.roomManager.createRoom({
			doors: new THREE.Vector4(cell.x, cell.y, cell.z, 0) // cell
		});

		if (!room) {
			console.warn("failed to create room at", pos.toArray(), "with doors", cell);

			// create empty room
			room = new Room();
		}

		room.parent = this;
		this.rooms.set(pos.toString(), room);
		this.roomPositions.set(room, pos.clone());
	}

	/**
	 * returns an array of all the rooms in this maze
	 * @return {Room[]}
	 */
	listRooms() {
		return Array.from(this.rooms).map(d => d[1]);
	}

	getRoomVisited(pos) {
		let room = this.getRoom(pos);
		return !!this.visitedRooms.get(room);
	}

	setRoomVisited(pos, visited = true) {
		let room = this.getRoom(pos);
		this.visitedRooms.set(room, visited);
		return this;
	}

	get size() {
		return this.generator.size.clone();
	}

	get roomSize() {
		return Room.SIZE;
	}

	get axes() {
		return this.generator.axes;
	}
	get vec() {
		return this.generator.vec;
	}
	get start() {
		return this.generator.start;
	}
	get end() {
		return this.generator.end;
	}
}
