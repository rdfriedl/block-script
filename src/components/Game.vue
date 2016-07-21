<!-- HTML -->
<template>

<div v-el:canvas class="canvas-container"></div>

<div class="pointer-lock-overlay" v-show="!hasPointerLock" @click="requestPointerLock">
	<h1>Click to enable Pointer Lock</h1>
</div>

<div v-el:stats class="stats-container"></div>
<div class="col-xs-12">
	<a class="btn btn-md btn-info pull-right" v-link="'/menu'"><i class="fa fa-arrow-left"></i> Back</a>
</div>

</template>

<!-- JS -->
<script>

export default {
	data() {
		return {
			hasPointerLock: false
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
		initPlayer.call(this, game);

		// create clock
		let clock = new THREE.Clock();
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled){
				game.updates.forEach(fn => fn(dtime));
			}

			// render
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

window.blocks = blocks;

import Keyboard from '../js/Keyboard.js';
import Player from '../js/objects/Player.js';
import RecursiveBacktracker from '../js/maze-generators/RecursiveBacktracker.js';
import RoomMaze from '../js/rooms/RoomMaze.js';
import DefaultRooms from '../js/rooms.js';

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
	// scene.add(new THREE.AmbientLight(0xffffff));

	// create collision world
	let world = game.world = new CollisionWorld();

	// create map
	let map = game.map = new VoxelMap();
	map.blockManager.registerBlock(blocks);
	map.blockManager.usePool = true;
	map.useNeighborCache = false;
	scene.add(map);

	// add map to collision world
	map.collision = new CollisionEntityVoxelMap(map);
	world.addEntity(map.collision);

	// update the world
	game.updates.push((dtime) => {
		// only update the collision world if the chunk the player is standing in is loaded
		if(map.hasChunk(game.player.position.clone().divide(map.blockSize).divide(map.chunkSize).floor())){
			world.step(dtime);
		}
	})

	let time = Math.floor(Math.random()*5);
	let room = DefaultRooms.createRoom({
		doors: {
			x:{p:true,n:true},
			z:{p:true,n:true}
		}
	});
	room.selection.listBlocks().forEach(block => {
		block.setProp('time', time);
	})
	room.selection.addTo(map);
	map.updateChunks();
}

function initPlayer(game){
	// create player
	let player = game.player = new Player();
	game.scene.add(player);

 	// light
 	let light = new THREE.PointLight(0xffffff, 0.2, 500);
 	player.add(light);

 	let flashLight = game.flashLight = new THREE.SpotLight(0xffffff, 1, 600, 0.5, 0.5, 1);
 	player.camera.add(flashLight);
 	player.camera.add(flashLight.target);
 	flashLight.position.set(10,-10,0);
 	flashLight.target.position.set(0,0,-flashLight.distance);

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
		},
		// crouch
		// {
		// 	keys: 'ctrl',
		// 	on_keydown: () => player.movement.crouch = true,
		// 	on_keyup: () => player.movement.crouch = false
		// }
	]);

	// update player
	game.updates.push(() => {
		controls.enabled = this.hasPointerLock;
		player.update();
	})

	// add player to the collision world
	game.world.addEntity(player.collision);
	player.getPosition().set(7,15,16).multiply(game.map.blockSize);
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
