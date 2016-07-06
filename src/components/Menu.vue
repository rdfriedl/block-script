<!-- HTML -->
<template>

<div v-el:canvas class="canvas-container"></div>

<!-- github corner -->
<a href="https://github.com/rdfriedl/block-script" class="github-corner"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#2b3e50; position: absolute; top: 0; border: 0; right: 0;"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a>
<style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out;}@keyframes octocat-wave{0%,100%{transform:rotate(0);}20%,60%{transform:rotate(-25deg);}40%,80%{transform:rotate(10deg);}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none;}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out;}}</style>

<div class="flex-v" style="align-items: center">
	<h1 class="text-center title" style="margin-top: 10vh;">
		<small><css-cube :side="cubeSide" :top="cubeTop" :bottom="cubeBottom"></css-cube></small>
		Block-Script
	</h1>
	<div class="col-xs-12 col-sm-8 col-md-6 col-lg-4" style="margin: 40px 0;">
		<button type="button" class="btn btn-lg btn-block btn-success" v-link="'/maps'"><i class="fa fa-gamepad"></i> Play</button>
		<button type="button" class="btn btn-lg btn-block btn-default" v-link="'/help'"><i class="fa fa-question"></i> Help</button>
		<button type="button" class="btn btn-lg btn-block btn-default" v-link="'/settings'"><i class="fa fa-cogs"></i> Settings</button>
		<button type="button" class="btn btn-lg btn-block btn-default" v-link="'/credits'"><i class="fa fa-bars"></i> Credits</button>
	</div>
</div>

<a class="created-by btn btn-info btn-xs" href="http://rdfriedl.github.io" target="_blank">Created by RDFriedl</a>

</template>

<!-- JS -->
<script>

import $ from 'jquery';
import THREE from 'three';
import CssCube from './CssCube.vue';
import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';
import * as blocks from '../js/blocks.js';
import * as ChunkUtils from '../js/ChunkUtils.js';

import ChunkGeneratorFlat from '../js/generators/ChunkGeneratorFlat.js';

import CollisionWorld from '../js/collisions/CollisionWorld.js';
import CollisionEntityBox from '../js/collisions/types/box.js';
import CollisionEntityVoxelMap from '../js/collisions/types/voxelMap.js';

export default {
	components: {CssCube},
	data() {
		return {
			enabled: false,
			cubeSide: require('../res/img/blocks/grass_side.png'),
			cubeTop: require('../res/img/blocks/grass_top.png'),
			cubeBottom: require('../res/img/blocks/dirt.png')
		}
	},
	created(){
		this.three = {};

		let renderer = this.three.renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0x2b3e50, 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// create scene
		let camera, scene;
		let map, velocity = new THREE.Vector3((Math.random()-0.5)*0.003,(Math.random()-0.5)*0.003,(Math.random()-0.5)*0.003);
		let clock = new THREE.Clock(), i = 0;

		let box1, box2, mesh1, mesh2, collisionMap;
		let collitionWorld;

		function init(){
			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
			camera.position.z = 600;
			camera.position.y = 100;
			scene = new THREE.Scene();

			//if we are debugging add this to global scope
			if(process.env.NODE_ENV == 'dev') window.menuScene = scene;

			//create voxel map
			map = new VoxelMap();
			map.blockManager.registerBlock(blocks);
			scene.add(map);
			ChunkUtils.drawCube(map, new THREE.Vector3(-10,-1,-10), new THREE.Vector3(10,0,10), function(){return blockList[Math.floor(Math.random()*blockList.length)] }, 'solid');
			ChunkUtils.drawCube(map, new THREE.Vector3(-10,0,-10), new THREE.Vector3(10,1,10), function(){return blockList[Math.floor(Math.random()*blockList.length)] }, 'frame');
			map.updateChunks();

			collisionMap = new CollisionEntityVoxelMap(map);

			box1 = new CollisionEntityBox(new THREE.Vector3(200,10,200), new THREE.Vector3(0,5,0));
			box1.isStatic = true;

			box2 = new CollisionEntityBox(new THREE.Vector3(50,50,50));
			box2.onCollision = (entity, normal) => {
				if(normal.y !== 0){
					box2.velocity.y = 0;
				}
			}

			collitionWorld = new CollisionWorld();
			// collitionWorld.addEntity(box1);
			collitionWorld.addEntity(collisionMap);
			collitionWorld.addEntity(box2);

			mesh2 = new THREE.Mesh(new THREE.BoxGeometry(50,50,50), new THREE.MeshLambertMaterial({color: 0xff0000}));

			scene.add(mesh2);

			window.reset = () => {
				box2.position.set(0,100,0);
				box2.velocity.set((Math.random()*2-1)*100,50,(Math.random()*2-1)*100);
			}
			window.reset();

			// add lights
			let light = new THREE.DirectionalLight(0xffffff);
			light.intensity = 0.5;
			light.position.set(1, 1, 1);
			scene.add(light);

			let ambient = new THREE.AmbientLight(0x666666);
			ambient.intensity = 0.5;
	    	scene.add(ambient);
		}

		const range = 12;
		const blockList = Object.keys(blocks).map(key => blocks[key].UID)//.filter(UID => !UID.includes('glass'));
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
			map.updateChunks();
		}

		// resize
		$(window).resize(() =>{
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		function animate(dtime){
			collitionWorld.step(dtime);

			mesh2.position.copy(box2.position);

			if(box2.position.y < -100){
				window.reset();
			}
			// map.rotation.x += velocity.x;
			// map.rotation.y += velocity.y;
			// map.rotation.z += velocity.z;

			// let change = 0.0001;
			// velocity.x += (Math.random()-0.5)*change;
			// velocity.y += (Math.random()-0.5)*change;
			// velocity.z += (Math.random()-0.5)*change;
			// let min = -0.005, max = 0.005;
			// velocity.clamp(new THREE.Vector3(min,min,min), new THREE.Vector3(max,max,max));
		}
		function render(dtime){
			renderer.render( scene, camera );
		}
		let update = function(){
			let dtime = clock.getDelta();
			clock.running = this.enabled;
			if(this.enabled){
				animate(dtime);
				render(dtime);

				// //toggle blocks
				// i += dtime;
				// if(i > 1/20){
				// 	toggleBlock();
				// 	i = 0;
				// }

				//toggle blocks
				i += dtime;
				if(i > 1/0.5){
					box2.velocity.y =+ 200;
					i = 0;
				}
			}
			requestAnimationFrame(update);
		}.bind(this)

		init();
		update();
	},
	attached(){
		//add it to my element
		$(this.three.renderer.domElement).appendTo(this.$els.canvas);
		this.enabled = true;
	},
	detached(){
		this.enabled = false;
	}
}

</script>

<style scoped>

.created-by{
	position: fixed;
	right: 10px;
	bottom: 10px;
}
.git_fork_link{
	position: absolute;
	right: 0px;
	top: 0px;
	transition: all 0.5s;
	width: 10%;
}
.git_fork_link img{
	width: 100%;
}
.canvas-container{
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: -100;
}
.title{
	filter: drop-shadow(0 0 15px);
}

</style>
