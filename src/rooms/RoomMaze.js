import { Vector4, Vector3 } from "three";
import Room from "./Room.js";
import RoomManager from "./RoomManager.js";
import MazeGenerator from "../maze-generators/MazeGenerator.js";

/** takes a {@link MazeGenerator} and a {@link RoomManager} and builds a maze out of {@link Room}s */
export default class RoomMaze {
	/**
	 * @param {MazeGenerator} mazeGenerator
	 * @param {RoomManager} [roomManager=RoomManager.inst]
	 */
	constructor(mazeGenerator, roomManager = RoomManager.inst) {
		if (!(mazeGenerator instanceof MazeGenerator))
			throw new Error("RoomMaze requires a MazeGenerator as the first argument");

		/**
		 * the maze generator that will be used when creating the rooms
		 * @type {MazeGenerator}
		 */
		this.generator = mazeGenerator;

		/** @type {RoomManager} */
		this.roomManager = roomManager;

		/** @type {Map<string, Room>} */
		this.rooms = new Map();

		/** @type {WeakMap<Room, RoomMaze#vec>} */
		this.roomPositions = new WeakMap();

		this.tmpVec = new this.vec();

		if (!this.generator.cells) this.generator.generate();
	}

	/**
	 * check if there is a room at the position, or if the room is part of this maze
	 * @param {RoomMaze#vec|Room} positionOrRoom the position to check, or the Room itself
	 * @return {bool}
	 */
	hasRoom(positionOrRoom) {
		if (positionOrRoom instanceof Vector4)
			positionOrRoom = new Vector3(positionOrRoom.x, positionOrRoom.y, positionOrRoom.z);

		if (positionOrRoom instanceof this.vec) {
			return this.rooms.has(positionOrRoom.toString());
		} else if (positionOrRoom instanceof Room) {
			for (let room of this.rooms) {
				if (positionOrRoom === room[1]) return true;
			}
		}
		return false;
	}

	/** gets or creates a room at the position
	 * @param {RoomMaze#vec} position
	 * @return {Room}
	 */
	getOrCreateRoom(position) {
		if (!this.hasRoom(position)) {
			return this.createRoom(position);
		} else {
			return this.getRoom(position);
		}
	}

	/**
	 * returns a room at the position
	 * @param {RoomMaze#vec} position the rooms position
	 * @return {Room}
	 */
	getRoom(position) {
		if (position instanceof Vector4) position = new Vector3(position.x, position.y, position.z);

		return this.rooms.get(position.toString());
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
	 * @return {Room} returns the new Room
	 */
	createRoom(position) {
		if (position instanceof Vector4) position = new Vector3(position.x, position.y, position.z);

		if (this.hasRoom(position)) throw new Error("cant create a room where one already exists");

		let pos = this.tmpVec.copy(position);
		let cell = this.generator.getCell(position);
		if (!cell) {
			return this.roomManager.createEmptyRoom();
		}

		let room = this.roomManager.createRoom({
			doors: new Vector4(cell.x, cell.y, cell.z, 0) // cell
		});

		if (!room) {
			console.warn("failed to create room at", pos.toArray(), "with doors", cell);

			return this.roomManager.createEmptyRoom();
		}

		room.parent = this;
		this.rooms.set(pos.toString(), room);
		this.roomPositions.set(room, pos.clone());

		return room;
	}

	/**
	 * returns an array of all the rooms in this maze
	 * @return {Room[]}
	 */
	listRooms() {
		return Array.from(this.rooms).map(d => d[1]);
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
