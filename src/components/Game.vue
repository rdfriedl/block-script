<!-- HTML -->
<template>

<div v-el:stats class="stats-container"></div>
<div v-el:canvas class="canvas-container"></div>

<div class="col-xs-12">
	<div class="page-header">
		<h1>load map: {{$route.params.mapID}}</h1>
	</div>
	<a class="btn btn-md btn-info" v-link="'/maps'"><i class="fa fa-arrow-left"></i> Back</a>
	<a href="http://threejs.org" class="btn btn-info" target="_blank">Three.js {{version}}</a>
</div>

</template>

<!-- JS -->
<script>

import $ from 'jquery';
import THREE from 'three';
// extentions
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';
import 'imports?THREE=three!../lib/threejs/loaders/ColladaLoader.js';
// import 'imports?THREE=three!../lib/threejs/controls/FlyControls.js';
// import 'imports?THREE=three!../lib/threejs/controls/TrackballControls.js';
import 'imports?THREE=three!../lib/threejs/controls/OrbitControls.js';

import Stats from 'stats';

import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';
import * as blocks from '../js/blocks.js';
import * as ChunkUtils from '../js/ChunkUtils.js';
import ChunkGeneratorFlat from '../js/generators/ChunkGeneratorFlat.js';

import vertexShader from '../shaders/vertexShader.shader';
import fragmentShader from '../shaders/fragmentShader.shader';

export default {
	data() {
		return {
			version: 'r'+THREE.REVISION
		};
	},
	created(){
		let renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// create scene
		let scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0xbfd1e5,4 * 10 / 100000);
		//if we are debugging add this to global scope
		if(process.env.NODE_ENV == 'dev') window.gameScene = scene;

		let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);
		camera.position.z = 600;

		let controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableKeys = false;
		controls.rotateSpeed = 0.25;

		// let controls = new THREE.TrackballControls( camera );
		// controls.rotateSpeed = 1.0;
		// controls.zoomSpeed = 1.2;
		// controls.panSpeed = 0.8;
		// controls.noZoom = false;
		// controls.noPan = false;
		// controls.staticMoving = true;
		// controls.dynamicDampingFactor = 0.3;
		// controls.keys = [ 65, 83, 68 ];

		let map = new VoxelMap();
		map.blockManager.registerBlock(blocks);
		map.updateChunks();
		scene.add(map);

		let generator = new ChunkGeneratorFlat();

		// ChunkUtils.drawCube(map, new THREE.Vector3(-20,-20,-20), new THREE.Vector3(20,20,20), 'stone', 'frame');

		let clock = new THREE.Clock(), i = 0;
		let stats;

		setUpSky();

		// stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		const range = 12;
		const blockList = Object.keys(blocks).map(key => blocks[key].UID).filter(UID => !UID.includes('glass'));
		function toggleBlock(){
			let pos = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(range*2);
			while(Math.abs(pos.length()) > range){
				pos = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(range*2);
			}

			//random rotation
			let rotation = new THREE.Vector3(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2).divideScalar(Math.PI*2/4).round().multiplyScalar(Math.PI*2/4);

			if(map.getBlock(pos)){
				map.removeBlock(pos);
			}
			else{
				map.setBlock(VoxelBlockManager.inst.createBlock(blockList[Math.floor(Math.random()*blockList.length)], {rotation: rotation.toArray()}), pos);
			}
			// map.updateChunks();
		}
		function loadNextChunk(){
			let vec = new THREE.Vector3(),
				dist = 0;

			const range = 2;
			let p = controls.target.clone().divide(map.blockSize).divide(map.chunkSize).floor();

			while(dist < range){
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

		// resize
		$(window).resize(() =>{
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		function animate(dtime){
			controls.update();
			stats.update();
		}
		function render(dtime){
			renderer.render(scene, camera);
		}

		let loadTimer = 0;
		let update = function(){
			let dtime = clock.getDelta();
			clock.running = this.enabled;
			if(this.enabled){
				animate(dtime);
				render(dtime);

				//toggle blocks
				i += dtime;
				if(i > 1/40){
					// toggleBlock();
					i = 0;
				}

				//load chunks
				loadTimer += dtime;
				if(loadTimer > 1/4){
					loadNextChunk();
					loadTimer = 0;
				}
			}
			requestAnimationFrame(update);
		}.bind(this)

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

		update();

		this._renderer = renderer;
		this._stats = stats;
	},
	attached(){
		//add it to my element
		this.$els.stats.appendChild(this._stats.domElement);
		this.$els.canvas.appendChild(this._renderer.domElement);
		this.enabled = true;
	},
	detached(){
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

</style>
