<!-- HTML -->
<template>

<div v-el:canvas class="canvas-container"></div>

<div class="pointer-lock-overlay" v-show="!hasPointerLock" @click="requestPointerLock">
	<h1>Click to enable Pointer Lock</h1>
</div>

<div v-el:stats class="stats-container"></div>
<div class="col-xs-12">
	<a class="btn btn-md btn-info pull-right" v-link="'/maps'"><i class="fa fa-arrow-left"></i> Back</a>
</div>

</template>

<!-- JS -->
<script>

import THREE from 'three';
import Stats from 'stats';
import gameScene from '../js/scenes/game.js';

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
		// create renderer
		let renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// resize renderer
		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// create stats
		let stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		// create scene
		let scene = gameScene();

		// create clock
		let clock = new THREE.Clock();
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled)
				scene.update(dtime);

			stats.update();

			// render
			renderer.render(scene.scene, scene.player.camera);

			requestAnimationFrame(update.bind(this));
		}

		// save some stuff to vue controler
		this._renderer = renderer;
		this._stats = stats;
		this._keyboard = scene.keyboard;

		// start
		update.call(this);

		// listen for pointer lock change
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', () => {
			this.hasPointerLock = !!document.pointerLockElement;
		});

		// debug
		if(process.env.NODE_ENV == 'dev'){
			window.player = scene.player;
			window.map = scene.map;
		}
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
