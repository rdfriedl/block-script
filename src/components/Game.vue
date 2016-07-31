<!-- HTML -->
<template>

<div v-el:canvas class="canvas-container"></div>

<div class="pointer-lock-overlay" v-show="!hasPointerLock && !showingMap" @click="requestPointerLock">
	<h1>Click to enable Pointer Lock</h1>
</div>

<div v-el:stats class="stats-container"></div>
<div class="col-xs-12">
	<a class="btn btn-md btn-info pull-right" v-link="'/menu'"><i class="fa fa-arrow-left"></i> Back</a>
</div>

</template>

<!-- JS -->
<script>

const MAZE_SIZE = new THREE.Vector3(5,5,5);

export default {
	data() {
		return {
			hasPointerLock: false,
			showingMap: false
		};
	},
	methods: {
		requestPointerLock: function(){
			document.body.requestPointerLock();
		},
		exitPointerLock: function(){
			document.exitPointerLock();
		}
	},
	created(){
		let game = this.game = {
			updates: []
		};

		initRenderer.call(this, game);
		initScene.call(this, game);
		initMaze.call(this, game);
		initMazeMap.call(this, game);
		initPlayer.call(this, game);

		if(process.env.NODE_ENV == 'dev')
			initDebug.call(this, game);

		game.keyboard.register_many([
			{
				keys: 'e',
				on_keydown: () => {
					this.showingMap = !this.showingMap;
					if(this.showingMap)
						this.exitPointerLock();
					else
						this.requestPointerLock();
				}
			}
		])

		// create clock
		let clock = new THREE.Clock();
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled){
				game.updates.forEach(fn => fn(dtime));
			}

			// render
			if(this.showingMap)
				game.renderer.render(game.map.scene, game.map.camera);
			else
				game.renderer.render(game.scene, game.player.camera);

			requestAnimationFrame(update.bind(this));
		}

		// start
		update.call(this);

		// listen for pointer lock change
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', () => {
			this.hasPointerLock = !!document.pointerLockElement;
		});

		// debug
		if(process.env.NODE_ENV == 'dev'){
			window.game = game;
		}
	},
	attached(){
		//add it to my element
		this.$els.stats.appendChild(this.game.stats.domElement);
		this.$els.canvas.appendChild(this.game.renderer.domElement);
		this.game.keyboard.listen();
		this.enabled = true;
	},
	detached(){
		this.game.keyboard.stop_listening();
		this.enabled = false;
	}
}

import THREE from 'three';
// extentions
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';
import Stats from 'stats';

import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';
import * as blocks from '../js/blocks.js';
import * as ChunkUtils from '../js/ChunkUtils.js';

window.blocks = blocks;

import Keyboard from '../js/Keyboard.js';
import Player from '../js/objects/Player.js';
import RecursiveBacktracker from '../js/maze-generators/RecursiveBacktracker.js';
import RoomMaze from '../js/rooms/RoomMaze.js';
import DefaultRooms from '../js/rooms.js';

import MazeLevelHelper from '../js/objects/map/MazeLevelHelper.js';

import CollisionWorld from '../js/collisions/CollisionWorld.js';
import CollisionEntityVoxelMap from '../js/collisions/types/voxelMap.js';

// shaders
import skyVertexShader from '../shaders/vertexShader.shader';
import skyFragmentShader from '../shaders/fragmentShader.shader';

function initRenderer(game){
	// create renderer
	let renderer = game.renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// resize renderer
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	// create stats
	let stats = game.stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';

	game.updates.push(() => stats.update());

	// create keyboard
	let keyboard = game.keyboard = new Keyboard();
}

function initScene(game){
	// create scene
	let scene = game.scene = new THREE.Scene();

	// create light
	scene.add(new THREE.AmbientLight(0xffffff, 0.03));

	// create collision world
	let world = game.world = new CollisionWorld();

	// create voxelMap
	let voxelMap = game.voxelMap = new VoxelMap();
	voxelMap.blockManager.registerBlock(blocks);
	voxelMap.blockManager.usePool = true;
	voxelMap.useNeighborCache = false;
	scene.add(voxelMap);

	voxelMap.addEventListener('chunk:built', event => {
		event.chunk.mesh.castShadow = true;
		event.chunk.mesh.receiveShadow = true;
	})

	// add voxelMap to collision world
	voxelMap.collision = new CollisionEntityVoxelMap(voxelMap);
	world.addEntity(voxelMap.collision);

	// update the world
	game.updates.push((dtime) => {
		// only update the collision world if the chunk the player is standing in is loaded
		if(voxelMap.hasChunk(game.player.position.clone().divide(voxelMap.blockSize).divide(voxelMap.chunkSize).floor())){
			world.step(dtime);
		}
	})

	let time = Math.floor(Math.random()*5);
	voxelMap.time = time;

	// load chunks from maze
	const VIEW_RANGE = new THREE.Vector3(2,2,2);
	const UNLOAD_RANGE = new THREE.Vector3(3,3,3);

	function loadChunk(pos){
		let roomSize = game.maze.rooms.roomSize.clone().map(v => v-=1);
		let chunkSize = voxelMap.chunkSize.clone().map(v => v-=1);

		let chunk = voxelMap.createChunk(pos);
		let chunkPosition = chunk.worldPosition; // the position of the chunk in blocks
		let chunkRoomBBox = new THREE.Box3();
		chunkRoomBBox.min.copy(chunk.worldPosition).divide(game.maze.rooms.roomSize).floor();
		chunkRoomBBox.max.copy(chunk.worldPosition).add(chunkSize).divide(game.maze.rooms.roomSize).floor();

		// find all the rooms we overlap
		let roomPosition = new THREE.Vector3();
		for (let x = chunkRoomBBox.min.x; x <= chunkRoomBBox.max.x; x++) {
			for (let y = chunkRoomBBox.min.y; y <= chunkRoomBBox.max.y; y++) {
				for (let z = chunkRoomBBox.min.z; z <= chunkRoomBBox.max.z; z++) {
					let room = game.maze.rooms.getRoom(roomPosition.set(x,y,z));
					if(!room){
						continue;
					}

					roomPosition.set(x,y,z).multiply(game.maze.rooms.roomSize); //convert room position into blocks

					// get overlap
					let overlap = new THREE.Box3();
					overlap.min.set(-Infinity,-Infinity,-Infinity).max(chunkPosition).max(roomPosition);
					overlap.max.set(Infinity,Infinity,Infinity).min(chunkPosition.clone().add(voxelMap.chunkSize)).min(roomPosition.clone().add(roomSize));

					ChunkUtils.copyBlocks(room.selection, chunk, overlap.min.clone().sub(roomPosition), overlap.max.clone().sub(roomPosition), {
						offset: overlap.min.clone().sub(chunkPosition),
						keepOffset: false
					})
				}
			}
		}

		voxelMap.updateChunks();
	}
	function findUnloadedChunk(){
		let playerChunkPos = game.player.getPosition().clone().divide(voxelMap.blockSize).divide(voxelMap.chunkSize).floor();
		let min = playerChunkPos.clone().sub(VIEW_RANGE);
		let max = playerChunkPos.clone().add(VIEW_RANGE);

		let pos = new THREE.Vector3();
		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				for (let z = min.z; z <= max.z; z++) {
					pos.set(x,y,z);

					if(!voxelMap.hasChunk(pos)){
						loadChunk(pos);
						return;
					}
				}
			}
		}
	}
	function unloadChunks(){
		let playerChunkPos = game.player.getPosition().clone().divide(voxelMap.blockSize).divide(voxelMap.chunkSize).floor();
		voxelMap.listChunks().forEach(chunk => {
			let dist = chunk.chunkPosition.clone().sub(playerChunkPos).abs();
			if(dist.x > UNLOAD_RANGE.x || dist.y > UNLOAD_RANGE.y || dist.z > UNLOAD_RANGE.z){
				// dispose of the blocks
				chunk.clearBlocks();

				// remove the chunk from the voxelMap
				voxelMap.removeChunk(chunk);
			}
		})
	}

	let loadTimer = 0, unloadTimer = 0;
	const loadEvery = 1/60, unloadEvery = 1/4;
	game.updates.push(dtime => {
		if((loadTimer += dtime) > loadEvery){
			loadTimer = 0;
			findUnloadedChunk();
		}

		if((unloadTimer += dtime) > unloadEvery){
			unloadTimer = 0;
			unloadChunks();
		}
	});
}

function initMaze(game){
	let maze = game.maze = {};

	// create maze
	let generator = maze.generator = new RecursiveBacktracker(THREE.Vector3, MAZE_SIZE);
	generator.generate({
		weights: new THREE.Vector3(1, 0, 1) //make it so it only goes up or down if it has to
	})
	let rooms = maze.rooms = new RoomMaze(generator, DefaultRooms);
}

function initPlayer(game){
	// create player
	let player = game.player = new Player();
	game.scene.add(player);

	// create controls
	let controls = game.controls = new THREE.PointerLockControls(player.camera);
	player.add(controls.getObject());
	controls.getObject().position.set(0,0,0);
	player.controls = controls;

	// bind keybindings for player
	game.keyboard.register_many([
		//up
		{
			keys: 'w',
			on_keydown: () => player.movement.forward = true,
			on_keyup: () => player.movement.forward = false
		},
		{
			keys: 'up',
			on_keydown: () => player.movement.forward = true,
			on_keyup: () => player.movement.forward = false
		},
		//left
		{
			keys: 'a',
			on_keydown: () => player.movement.left = true,
			on_keyup: () => player.movement.left = false
		},
		{
			keys: 'left',
			on_keydown: () => player.movement.left = true,
			on_keyup: () => player.movement.left = false
		},
		//down
		{
			keys: 's',
			on_keydown: () => player.movement.back = true,
			on_keyup: () => player.movement.back = false
		},
		{
			keys: 'down',
			on_keydown: () => player.movement.back = true,
			on_keyup: () => player.movement.back = false
		},
		//right
		{
			keys: 'd',
			on_keydown: () => player.movement.right = true,
			on_keyup: () => player.movement.right = false
		},
		{
			keys: 'right',
			on_keydown: () => player.movement.right = true,
			on_keyup: () => player.movement.right = false
		},
		// sprint
		{
			keys: 'shift',
			on_keydown: () => player.movement.sprint = true,
			on_keyup: () => player.movement.sprint = false
		},
		// jump
		{
			keys: 'space',
			on_keydown: () => player.movement.jump = true,
			on_keyup: () => player.movement.jump = false
		},
		{
			keys: 'num_0',
			on_keydown: () => player.movement.jump = true,
			on_keyup: () => player.movement.jump = false
		}
	]);

	// update player
	game.updates.push(() => {
		controls.enabled = this.hasPointerLock;
		player.update();
	})

	// add player to the collision world
	game.world.addEntity(player.collision);
	player.getPosition().set(32/2,16/2,32/2).add(game.maze.generator.start).multiply(game.voxelMap.blockSize);
}

function initMazeMap(game){
	let map = game.map = {};

	const roomSize = new THREE.Vector3(16,16,16);

	let scene = map.scene = new THREE.Scene();
	let camera = map.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 10000);

	// set camera position
	camera.position.set(0, 0.5, 1).multiply(this.game.maze.generator.size).multiply(roomSize);
	camera.lookAt(scene.position);

	// create maze levels
	let levels = map.levels = new THREE.Group();

	// create levels
	for(let y = 0; y < game.maze.generator.size.y; y++){
		let level = new MazeLevelHelper(game.maze.rooms);
		level.roomSize.copy(roomSize);

		level.level = y;
		level.time = 0;
		level.position.copy(game.maze.generator.size).divideScalar(2).negate().add(new THREE.Vector3(0, y, 0)).multiply(roomSize);

		levels.add(level);

		// build the level
		level.update();
	}

	// tmp add it to the game scene
	scene.add(levels);

	// update the level
	game.updates.push((dtime) => {
		levels.rotation.y += Math.PI/16 * dtime;
	})

	// add player icon to map
	let geo = new THREE.ConeBufferGeometry(1, 5, 8)
	geo.rotateX(Math.PI / 2);
	let player = game.map.player = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
		color: 0xff8400,
		transparent: true,
		opacity: 0.5
	}))
	scene.add(player);

	// update player position
	game.updates.push(() => {
		player.position
			.copy(game.player.position)
			.divide(game.voxelMap.blockSize)
			.divide(game.maze.rooms.roomSize)
			.sub(MAZE_SIZE.clone().divideScalar(2))
			.multiply(roomSize)
			.applyQuaternion(game.map.levels.quaternion);

		player.lookAt(game.player.camera.getWorldDirection().multiplyScalar(10).applyQuaternion(game.map.levels.quaternion).add(player.position));
	})
}

function initDebug(game){
	window.playerRoom = function(){
		let playerRoomPosition = game.player.position.clone().divide(game.voxelMap.blockSize).divide(game.maze.roomSize).floor();
		let room = game.maze.getRoom(playerRoomPosition);
		console.log(room, playerRoomPosition);
	}
}

</script>

<style scoped>

.canvas-container{
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.pointer-lock-overlay{
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0,0,0,0.5);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

</style>
