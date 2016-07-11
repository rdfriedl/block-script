<!-- HTML -->
<template>

<div v-el:stats class="stats-container"></div>
<div v-el:canvas class="canvas-container"></div>

<div class="pointer-lock-overlay" v-show="!hasPointerLock" @click="requestPointerLock">
	<h1>Click to enable Pointer Lock</h1>
</div>

<div class="col-xs-12">
	<a class="btn btn-md btn-info pull-right" v-link="'/maps'"><i class="fa fa-arrow-left"></i> Back</a>
</div>

</template>

<!-- JS -->
<script>

import $ from 'jquery';
import THREE from 'three';
// extentions
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';
import 'imports?THREE=three!../lib/threejs/loaders/ColladaLoader.js';
import 'imports?THREE=three!../lib/threejs/controls/OrbitControls.js';
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';

import Stats from 'stats';

import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';
import * as blocks from '../js/blocks.js';
import * as ChunkUtils from '../js/ChunkUtils.js';
import ChunkGeneratorFlat from '../js/generators/ChunkGeneratorFlat.js';
import ChunkGeneratorRooms from '../js/generators/ChunkGeneratorRooms.js';

import Keyboard from '../js/Keyboard.js';
import Player from '../js/Player.js';

import CollisionWorld from '../js/collisions/CollisionWorld.js';
import CollisionEntityVoxelMap from '../js/collisions/types/voxelMap.js';

import vertexShader from '../shaders/vertexShader.shader';
import fragmentShader from '../shaders/fragmentShader.shader';

export default {
	data() {
		return {
			version: 'r'+THREE.REVISION,
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
		// create keyboard
		let keyboard = new Keyboard();

		// create renderer
		let renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// create scene
		let scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0xbfd1e5,4 * 10 / 100000);
		//if we are debugging add this to global scope
		if(process.env.NODE_ENV == 'dev') window.gameScene = scene;

		// create collision world
		let world = new CollisionWorld();

		// create player
		let player = new Player();
		scene.add(player);
		if(process.env.NODE_ENV == 'dev') window.player = player;

		// create controls
		let controls = new THREE.PointerLockControls(player.camera);
		player.add(controls.getObject());
		controls.getObject().position.set(0,0,0);
		player.controls = controls;

		// create map
		let map = new VoxelMap();
		map.blockManager.registerBlock(blocks);
		map.updateChunks();
		scene.add(map);

		// add map to collision world
		map.collision = new CollisionEntityVoxelMap(map);
		world.addEntity(map.collision);

		// add player to the collision world
		world.addEntity(player.collision);
		player.getPosition().copy(map.blockSize.clone().multiply(map.chunkSize).divideScalar(2));

		// create genorator
		let generator = new ChunkGeneratorRooms();

		let clock = new THREE.Clock(), i = 0;

		setUpSky();

		// stats
		let stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		// chunk loader
		const view_range = 2;
		function loadNextChunk(){
			let vec = new THREE.Vector3(),
				dist = 0;

			let p = player.position.clone().divide(map.blockSize).divide(map.chunkSize).floor();

			while(dist < view_range){
				let v = p.clone().add(vec);

				if(!map.hasChunk(v)){
					//create it
					let chunk = map.createChunk(v);
					generator.setUpChunk(chunk);
					map.updateChunks();
					break;
				}
				else{
					if(++vec.x > dist){
						vec.x = -dist;
						vec.y++;
					}
					if(vec.y > dist){
						vec.y = -dist;
						vec.z++;
					}
					if(vec.z > dist){
						dist++;
						vec.x = -dist;
						vec.y = -dist;
						vec.z = -dist;
					}
				}
			}
		}
		function unloadChunks(){
			let chunks = map.listChunks();
			chunks.forEach(chunk => {
				let dist = chunk.chunkPosition.clone().sub(player.position.clone().divide(map.chunkSize).divide(map.blockSize).floor()).abs().toArray();
				for (var i = 0; i < dist.length; i++) {
					if(dist[i] > view_range){
						// unload chunk
						map.removeChunk(chunk);
						break;
					}
				}
			})
		}

		// resize
		window.addEventListener('resize', () =>{
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// runtime functions
		function animate(dtime){
			// only update the collision world if the chunk the player is standing in is loaded
			if(map.hasChunk(player.position.clone().divide(map.blockSize).divide(map.chunkSize).floor())){
				world.step(dtime);
			}

			function callUpdate(object){
				object.children.forEach(obj => {
					if(obj.update)
						obj.update(dtime);

					if(obj.children)
						callUpdate(obj);
				})
			}
			callUpdate(scene);

			stats.update();
		}
		function render(dtime){
			renderer.render(scene, player.camera);
		}

		let loadTimer = 0;
		function update(){
			let dtime = clock.getDelta();
			clock.running = this.enabled;
			if(this.enabled){
				animate(dtime);
				render(dtime);

				//load chunks
				loadTimer += dtime;
				if(loadTimer > 1/10){
					loadNextChunk();
					unloadChunks();
					loadTimer = 0;
				}
			}
			requestAnimationFrame(update.bind(this));
		};

		let lightGroup, sun, ambient, sky;
		function setUpSky(){
			//light
			lightGroup = new THREE.Group();
			scene.add(lightGroup);

		    // SUN
			sun = new THREE.DirectionalLight( 0xffffff, 1 );
			sun.color.setHSL( 0.1, 1, 0.95 );
			sun.position.set( -1, 1.75, 1 );
		    sun.position.multiplyScalar(5000);

		 //    const shadowNear = 1200;
		 //    const shadowFar = 15000;

		 //    sun.castShadow = true;

		 //    sun.shadowCameraNear = shadowNear;
		 //    sun.shadowCameraFar = shadowFar;

			// sun.shadowBias = -0.0001;

		 //    sun.shadowMapDarkness = 0.8;
		 //    sun.shadowMapWidth = 1280 * 2;
		 //    sun.shadowMapHeight = 1280 * 2;

		 //    const size = 1000;
		 //    sun.shadowCameraLeft = -size;
		 //    sun.shadowCameraRight = size;
		 //    sun.shadowCameraTop = size;
		 //    sun.shadowCameraBottom = -size;

		    // sun.shadowCameraVisible = true;

		    lightGroup.add(sun);
		    lightGroup.add(sun.target);

		    // ambient light
			ambient = new THREE.AmbientLight( 0x888888 );
		    lightGroup.add(ambient);

			// SKYDOME
			let uniforms = {
				topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
				bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
				offset:		 { type: "f", value: 33 },
				exponent:	 { type: "f", value: 0.6 }
			};
			uniforms.topColor.value.setHSL( 0.6, 1, 0.6 );

			// scene.fog.color.copy( uniforms.bottomColor.value );

			let skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
			let skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });

			sky = new THREE.Mesh(skyGeo, skyMat);
			lightGroup.add(sky);
		}

		// start
		update.apply(this);

		// save some stuff to vue controler
		this._renderer = renderer;
		this._stats = stats;
		this._keyboard = keyboard;

		// listen for pointer lock change
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', () => {
			this.hasPointerLock = !!document.pointerLockElement;

			controls.enabled = this.hasPointerLock;
		});

		// bind keybindings
		keyboard.register_many([
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
	},
	attached(){
		//add it to my element
		this.$els.stats.appendChild(this._stats.domElement);
		this.$els.canvas.appendChild(this._renderer.domElement);
		this._keyboard.listen();
		this.enabled = true;
	},
	detached(){
		this._keyboard.stop_listening();
		this.enabled = false;
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
