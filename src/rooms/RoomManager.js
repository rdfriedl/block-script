import THREE from 'three';
import Room from './Room.js';
import MazeGenerator from '../maze-generators/MazeGenerator.js';

const ROOM_ROTATIONS = [0,1,2,3];

export default class RoomManager{
	constructor(){
		this.rooms = {};
	}

	static get inst(){
		return this._inst || (this._inst = new this())
	}

	register(id, selection, doors){
		this.rooms[id] = {
			id: id,
			selection: selection,
			doors: new THREE.Vector4().copy(doors)
		};
	}

	/**
	 * returns an array of rooms with rotations that match the searchg
	 * @param  {Object} search
	 * @return {Array[]}
	 */
	searchRooms(search){
		search = Object.assign({
			rotate: true
		}, search || {});

		let rooms = [];
		for(let id in this.rooms){
			let room = this.rooms[id];
			// check doors
			if(search.doors){
				if(search.rotate){
					for (var i = 0; i < ROOM_ROTATIONS.length; i++) {
						if(Room.rotateDoors(room.doors, ROOM_ROTATIONS[i]).equals(search.doors))
							rooms.push([room, ROOM_ROTATIONS[i]]);
					}
				}
				else if(new THREE.Vector4().copy(room.doors).equals(search.doors)){
					rooms.push([room, 0]);
				}
			}
		}

		return rooms;
	}

	createRoom(search){
		let rooms = this.searchRooms(search);
		let data = rooms[Math.floor(Math.random() * rooms.length)];
		if(data){
			let room = new Room(data[0].selection, data[0].doors);
			room.rotation = data[1];
			return room;
		}
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
