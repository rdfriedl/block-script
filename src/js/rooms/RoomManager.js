import THREE from 'three';
import Room from './Room.js';
import MazeGenerator from '../maze-generators/MazeGenerator.js';

export default class RoomManager{
	constructor(){
		this.rooms = {};
	}

	static get inst(){return this._inst || (this._inst = new this())}

	register(id, selection, doors){
		this.rooms[id] = {
			id: id,
			selection: selection,
			doors: doors
		};
	}

	_matchSearch(room, search){
		if(String.isString(search)){
			return search == room.id;
		}
		else if(Object.isObject(search)){
			// check doors
			if(search.doors){
				for(let axis in search.doors){
					for(let side in search.doors[axis]){
						if(search.doors[axis][side] === true){
							// if its true, they are looking for any type of door on this side
							if(room.doors[axis][side] === false)
								return false;
						}
						else if(String.isString(search.doors[axis][side]) || search.doors[axis][side] === false){
							// else they want a specific type of door or they dont want a door at all on this side
							if(search.doors[axis][side] !== room.doors[axis][side])
								return false;
						}
					}
				}
			}
			return true;
		}
	}

	/**
	 * returns an array of rooms that match the searchg
	 * @param  {Object} search
	 * @return {Object[]} an array of room objects
	 */
	searchRooms(search){
		let rooms = [];
		for(let id in this.rooms){
			if(this._matchSearch(this.rooms[id], search)){
				rooms.push(this.rooms[id]);
			}
		}

		return rooms;
	}

	createRoom(search){
		let rooms = this.searchRooms(search);
		let data = rooms[Math.floor(Math.random()*rooms.length)];
		if(data)
			return new Room(data.selection, data.doors);
	}

	listRooms(){
		let arr = [];
		for(let i in this.rooms){
			arr.push(this.rooms[i]);
		}
		return arr;
	}
}

RoomManager.DOOR_INDEX_POSITIVE = 0;
RoomManager.DOOR_INDEX_NEGATIVE = 1;
