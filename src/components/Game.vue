<!-- HTML -->
<template>
<div>
	<div ref="canvas" class="canvas-container"></div>

	<div class="pointer-lock-overlay" v-show="!hasPointerLock && state == 'none'" @click="requestPointerLock">
		<h1>Click to enable Pointer Lock</h1>
	</div>

	<div ref="stats" class="stats-container"></div>
	<div class="col-xs-12">
		<router-link to="/menu" class="btn btn-md btn-info pull-right"><i class="fa fa-arrow-left"></i> Back</router-link>
	</div>
</div>

</template>

<!-- JS -->
<script>
import Vue from 'vue';

const MAZE_SIZE = new THREE.Vector3(1, 1, 1).multiplyScalar(5);

export default {
	data(){
		return {
			hasPointerLock: false,
			state: 'none',
			map: {
				level: 0,
				time: 0
			}
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

		game.states = {
			none: {
				enter: () => {
					game.renderer.setClearColor(0x000000);
				}
			},
			map: {
				enter: () => {
					game.renderer.setClearColor(0x999999);
				}
			}
		}
		this.$watch('state', (newState, oldState) => {
			if(game.states[oldState] && game.states[oldState].exit)
				game.states[oldState].exit();

			if(game.states[newState] && game.states[newState].enter)
				game.states[newState].enter();
		})

		initRenderer.call(this, game);
		initScene.call(this, game);
		initMaze.call(this, game);
		initMazeMap.call(this, game);
		initPlayer.call(this, game);

		if(process.env.NODE_ENV == 'development')
			initDebug.call(this, game);

		game.keyboard.register_many([
			{
				keys: 'e',
				on_keydown: () => {
					if(this.state == 'none'){
						this.exitPointerLock();
						this.state = 'map';
					}
					else{
						this.requestPointerLock();
						this.state = 'none';
					}
				}
			}
		])

		// create clock
		let clock = new THREE.Clock();
		let timeSpeed = 1, _timeSpeed = 1;
		function update(){
			let dtime = clock.getDelta() * _timeSpeed;
			_timeSpeed += (timeSpeed - _timeSpeed)/20;

			if(this.enabled){
				game.updates.forEach(fn => fn(dtime));
			}

			// render
			if(this.state == 'map')
				game.renderer.render(game.map.scene, game.map.camera);
			else
				game.renderer.render(game.scene, game.player.camera);

			requestAnimationFrame(update.bind(this));
		}

		game.keyboard.register_many([
			{
				keys: 'LMB',
				on_keydown: () => timeSpeed = 0.1,
				on_keyup: () => timeSpeed = 1
			}
		])

		// start
		update.call(this);

		// listen for pointer lock change
		let pointerlockchange = () => {
			this.hasPointerLock = !!document.pointerLockElement;
		};
		document.addEventListener('pointerlockchange', pointerlockchange);
		document.addEventListener('mozpointerlockchange', pointerlockchange);
		document.addEventListener('webkitpointerlockchange', pointerlockchange);

		// debug
		if(process.env.NODE_ENV == 'development'){
			window.game = game;
		}

		// attached
		Vue.nextTick(() => {
			//add it to my element
			this.$refs.stats.appendChild(this.game.stats.domElement);
			this.$refs.canvas.appendChild(this.game.renderer.domElement);
			this.game.keyboard.listen();
			this.enabled = true;
		})
	},
	destroyed(){
		this.game.keyboard.stop_listening();
		this.enabled = false;
	}
}

import THREE from 'three';
// extentions
import 'imports-loader?THREE=three!three/examples/js/controls/PointerLockControls.js';
import Stats from 'stats';

import VoxelMap from '../voxel/VoxelMap.js';
import VoxelChunk from '../voxel/VoxelChunk.js';
import VoxelBlockManager from '../voxel/VoxelBlockManager.js';
import * as blocks from '../blocks/defaultBlocks.js';
import * as ChunkUtils from '../ChunkUtils.js';

window.blocks = blocks;

import Keyboard from '../keyboard.js';
import Player from '../objects/Player.js';
import RecursiveBacktracker from '../maze-generators/RecursiveBacktracker.js';
import RoomMaze from '../rooms/RoomMaze.js';
import DefaultRooms from '../rooms.js';

import MazeLevelHelper from '../objects/map/MazeLevelHelper.js';

import CollisionWorld from '../collisions/CollisionWorld.js';
import CollisionEntityVoxelMap from '../collisions/types/voxelMap.js';

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
	const VIEW_RANGE = new THREE.Vector3(2,2,2); //the chunk load range
	const UNLOAD_RANGE = new THREE.Vector3(2,2,2); //all chunks futhur then this are unloaded and their meshes are stored in the cache
	const UNLOAD_CACHE_RANGE = new THREE.Vector3(4,4,4); //all meshes in the cache that are further away then this are removed from the cache

	let geometryCache = {};
	let materialCache = {};

	if(process.env.NODE_ENV == 'development'){
		window.logChunkCache = () => {
			console.log(geometryCache, materialCache);
		}

		window.totalBlocksInMap = () => {
			let total = {};
			voxelMap.chunks.forEach(chunk => {
				chunk.blocks.forEach(block => {
					if(!total[block.id])
						total[block.id] = 0;

					total[block.id] += 1;
				})
			})
			return total;
		}

		window.totalBlocksInCache = () => {
			let total = {};
			voxelMap.blockManager.blocks.forEach(block => {
				if(!total[block.id])
					total[block.id] = 0;

				total[block.id] += 1;
			})
			return total;
		}

		window.logBlockInfo = () => {
			console.log('blocks in map');
			console.log(window.totalBlocksInMap());

			console.log('blocks in cache');
			console.log(window.totalBlocksInCache());
		}
	}

	function vectorInRange(vec, range){
		let playerChunkPos = game.player.getPosition().clone().divide(voxelMap.blockSize).divide(voxelMap.chunkSize).floor();
		return !(
			vec.x > playerChunkPos.x + range.x || vec.x < playerChunkPos.x - range.x ||
			vec.y > playerChunkPos.y + range.y || vec.y < playerChunkPos.y - range.y ||
			vec.z > playerChunkPos.z + range.z || vec.z < playerChunkPos.z - range.z
		);
	}
	function loadChunk(pos){
		let chunk = voxelMap.createChunk(pos);
		let cacheIndex = chunk.chunkPosition.toString();

		// load the blocks into the chunk
		let roomSize = game.maze.rooms.roomSize.clone().map(v => v-=1);
		let chunkSize = voxelMap.chunkSize.clone().map(v => v-=1);
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

		// see if we need to build the chunk
		if(!geometryCache[cacheIndex] || !materialCache[cacheIndex]){
			// build the chunk
			chunk.build();
			// cache the geometry and material
			geometryCache[cacheIndex] = chunk.mesh.geometry;
			materialCache[cacheIndex] = chunk.mesh.material;
		}
		else{
			// remove the mesh if the chunk has one
			if(chunk.mesh && chunk.mesh.parent)
				chunk.mesh.parent.remove(chunk.mesh);

			// create a new mesh out of the cached geometry and material
			chunk.mesh = new THREE.Mesh(geometryCache[cacheIndex], materialCache[cacheIndex]);
			chunk.mesh.scale.copy(chunk.blockSize);
			chunk.add(chunk.mesh);
		}

		return chunk;
	}
	function loadChunks(){
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
	function unloadCache(){
		let tmpVec = new THREE.Vector3();
		for(let pos in geometryCache){
			let vec = tmpVec.fromString(pos);
			if(!vectorInRange(vec, UNLOAD_CACHE_RANGE)){
				// its outside the cache range, unload it
				delete geometryCache[pos];
				delete materialCache[pos];
			}
		}
	}
	function unloadChunks(){
		voxelMap.listChunks().forEach(chunk => {
			if(!vectorInRange(chunk.chunkPosition, UNLOAD_RANGE)){
				// chunk is outside the unload range, unload it

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
			loadChunks();
		}

		if((unloadTimer += dtime) > unloadEvery){
			unloadTimer = 0;
			unloadChunks();
			unloadCache();
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
	let move = (dir, v) => {
		if(this.state == 'none')
			player.movement[dir] = v;
	}
	game.keyboard.register_many([
		//up
		{
			keys: 'w',
			on_keydown: () => move('forward', true),
			on_keyup: () => move('forward', false)
		},
		{
			keys: 'up',
			on_keydown: () => move('forward', true),
			on_keyup: () => move('forward', false)
		},
		//left
		{
			keys: 'a',
			on_keydown: () => move('left', true),
			on_keyup: () => move('left', false)
		},
		{
			keys: 'left',
			on_keydown: () => move('left', true),
			on_keyup: () => move('left', false)
		},
		//down
		{
			keys: 's',
			on_keydown: () => move('back', true),
			on_keyup: () => move('back', false)
		},
		{
			keys: 'down',
			on_keydown: () => move('back', true),
			on_keyup: () => move('back', false)
		},
		//right
		{
			keys: 'd',
			on_keydown: () => move('right', true),
			on_keyup: () => move('right', false)
		},
		{
			keys: 'right',
			on_keydown: () => move('right', true),
			on_keyup: () => move('right', false)
		},
		// sprint
		{
			keys: 'shift',
			on_keydown: () => move('sprint', true),
			on_keyup: () => move('sprint', false)
		},
		// jump
		{
			keys: 'space',
			on_keydown: () => move('jump', true),
			on_keyup: () => move('jump', false)
		},
		{
			keys: 'num_0',
			on_keydown: () => move('jump', true),
			on_keyup: () => move('jump', false)
		}
	]);

	// update player
	game.updates.push((dtime) => {
		controls.enabled = this.hasPointerLock;
		player.update(dtime);
	})

	// add player to the collision world
	game.world.addEntity(player.collision);
	player.getPosition().copy(game.maze.generator.start).multiply(game.maze.rooms.roomSize).add(game.maze.rooms.roomSize.clone().divideScalar(2)).multiply(game.voxelMap.blockSize);
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
	let currentViewingLevel = this.map.level;
	let levels = map.levels = new THREE.Group();

	// create levels
	for(let y = 0; y < game.maze.generator.size.y; y++){
		let level = new MazeLevelHelper(game.maze.rooms);
		level.roomSize.copy(roomSize);

		level.level = y;
		level.time = 0;
		level.position.copy(game.maze.generator.size).divideScalar(2).negate().setY(y).multiply(roomSize);

		levels.add(level);

		// build the level
		level.update();
	}

	// tmp add it to the game scene
	scene.add(levels);

	// update the level
	game.updates.push((dtime) => {
		// levels.rotation.y += Math.PI/16 * dtime;
		levels.position.y = -currentViewingLevel * roomSize.y;

		const spread = 2.5;
		levels.children.forEach(level => {
			level.position.setY((level.level + Math.clamp((level.level - currentViewingLevel)*spread, -spread, spread)) * roomSize.y);
		})

		currentViewingLevel += (this.map.level - currentViewingLevel)/10;
	})

	// bind keys
	game.keyboard.register_many([
		{
			keys: 'w',
			on_keydown: () => {
				if(this.state == 'map')
					this.map.level = Math.min(MAZE_SIZE.y-1, this.map.level + 1);
			}
		},
		{
			keys: 's',
			on_keydown: () => {
				if(this.state == 'map')
					this.map.level = Math.max(0, this.map.level - 1);
			}
		}
	])

	// add player icon to map
	let geo = new THREE.ConeBufferGeometry(1, 5, 8)
	geo.rotateX(Math.PI / 2);
	let player = game.map.player = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
		color: 0x3344dd,
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

		let playerLevel = Math.floor(game.player.position.y/game.voxelMap.blockSize.y/game.maze.rooms.roomSize.y);
		if(levels.children[playerLevel])
			player.position.y = levels.position.y + levels.children[playerLevel].position.y;

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
