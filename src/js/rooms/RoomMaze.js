import THREE from 'three';
import Room from './Room.js';
import RoomManager from './RoomManager.js';
import MazeGenerator from '../maze-generators/MazeGenerator.js';

/**
 * @class takes a {@link MazeGenerator} and a {@link RoomManager} and builds a maze out of {@link Room}s
 * @name RoomMaze
 * @param {MazeGenerator} mazeGenerator
 * @param {RoomManager} [roomManager]
 */
export default class RoomMaze{
	constructor(mazeGenerator, roomManager = RoomManager.inst){
		if(!mazeGenerator instanceof MazeGenerator)
			throw new Error('RoomMaze requires a MazeGenerator as the first argument');

		this.maze = mazeGenerator;
		this.roomManager = roomManager;

		this.rooms = new Map();
		this.roomPositions = new WeakMap();

		this.tmpVec = new this.vec;

		if(!this.maze.data)
			this.maze.generate();
	}

	hasRoom(pos){
		if(pos instanceof this.vec){
			return this.rooms.has(pos.toString());
		}
		else if(pos instanceof Room){
			for(let room of this.rooms){
				if(pos === room[1])
					return true;
			}
		}
		return false;
	}

	getRoom(pos){
		if(pos instanceof this.vec){
			if(!this.hasRoom(pos))
				this.createRoom(pos);

			return this.rooms.get(pos.toString());
		}
		else if(pos instanceof Room){
			if(this.hasRoom(pos))
				return pos;
		}
	}

	/**
	 * returns the position of the roomm in the maze
	 * @param  {Room} room
	 * @return {RoomMaze#vec}
	 */
	getRoomPosition(room){
		return this.roomPositions.get(room) || new this.vec;
	}

	/**
	 * creates the room for the position
	 * @param {RoomMaze#vec} position
	 * @return {this}
	 * @private
	 */
	createRoom(position){
		if(this.hasRoom(position))
			throw new Error('cant create a room where one already exists');

		let pos = this.tmpVec.copy(position);
		let cell = this.maze.getCell(position);
		if(!cell) return this;

		let doors = {};
		this.axes.forEach(axis => {
			doors[axis] = {
				p: !!(cell[axis] & MazeGenerator.DOOR_POSITIVE),
				n: !!(cell[axis] & MazeGenerator.DOOR_NEGATIVE)
			}
		})

		let room = this.roomManager.createRoom({
			doors: {
				x: {p: true, n: true},
				z: {p: true, n: true}
			}
		});

		if(!room){
			console.warn('failed to create room at', pos.toArray(), 'with doors', cell);

			// create empty room
			room = new Room();
		}

		room.parent = this;
		this.rooms.set(pos.toString(), room);
		this.roomPositions.set(room, pos.clone());
	}

	get size(){
		return this.maze.size.clone();
	}

	get roomSize(){
		return Room.SIZE;
	}

	get axes(){
		return this.maze.axes;
	}
	get vec(){
		return this.maze.vec;
	}
}
