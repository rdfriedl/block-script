import THREE from "three";
import RoomManager from "./rooms/RoomManager.js";

// import all the tests
let rooms = new RoomManager();
let files = require.context("./res/rooms/", true, /\.json$/);
files.keys().forEach(url => {
	let json = files(url);
	rooms.register(url.match(/[^/]*(?=\.json)/gi)[0], json.selection, new THREE.Vector4().copy(json.doors));
});

export { rooms as default };
