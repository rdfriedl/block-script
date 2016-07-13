<!-- HTML -->
<template>

<div v-el:canvas class="canvas-container"></div>

<nav class="navbar navbar-default" role="navigation">
	<ul class="nav navbar-nav">
		<li><div class="btn-group">
			<a v-link="'/menu'" class="btn btn-info"><i class="fa fa-arrow-left"></i> Back</a>
			<dropdown>
				<a class="dropdown-toggle btn btn-default" data-toggle="dropdown"><span>File</span></a>
				<ul slot="dropdown-menu" class="dropdown-menu">
					<li><a href="#"><i class="fa fa-plus"></i> New</a></li>
					<li><a href="#"><i class="fa fa-upload"></i> Load from file</a></li>
					<li><a href="#"><i class="fa fa-download"></i> Export to file</a></li>
					<li><a href="#"><i class="fa fa-cogs"></i> Options</a></li>
				</ul>
			</dropdown>
			<dropdown>
				<a class="dropdown-toggle btn btn-default" data-toggle="dropdown"><span>View</span></a>
				<ul slot="dropdown-menu" class="dropdown-menu">
					<li><a @click="view.edges = !view.edges">Edges <i class="fa fa-check" v-show="view.edges"></i></a></li>
					<li><a @click="view.blocks = !view.blocks">Blocks <i class="fa fa-check" v-show="view.blocks"></i></a></li>
					<li><a @click="view.walls = !view.walls">Walls <i class="fa fa-check" v-show="view.walls"></i></a></li>
				</ul>
			</dropdown>
		</div></li>
	</ul>
	<ul class="nav navbar-nav navbar-right">
		<li><a href="#">Link</a></li>
	</ul>
</nav>

</template>

<!-- JS -->
<script>

import $ from 'jquery';
import * as VueStrap from 'vue-strap';
import THREE from 'three';

// three plugins
import 'imports?THREE=three!../lib/threejs/controls/OrbitControls.js';
import 'imports?THREE=three!../lib/threejs/postprocessing/EffectComposer.js';
import 'imports?THREE=three!../lib/threejs/postprocessing/RenderPass.js';
import 'imports?THREE=three!../lib/threejs/postprocessing/ShaderPass.js';
import 'imports?THREE=three!../lib/threejs/shaders/CopyShader.js';
import 'imports?THREE=three!../lib/threejs/shaders/SSAOShader.js';

import GridCube from '../js/objects/GridCube.js';
import Keyboard from '../js/Keyboard.js';
import * as blocks from '../js/blocks.js';

import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';

import AttachTool from '../js/editor-tools/AttachTool.js';

const BLOCK_SIZE = 32;
const ROOM_SIZE = 20;

export default {
	components: {
		dropdown: VueStrap.dropdown
	},
	data() {
		return {
			view: {
				edges: false,
				walls: true,
				blocks: true
			}
		}
	},
	created(){
		// create renderer
		let renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x333333, 1);

		// resize renderer
		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// create scene
		let scene = new THREE.Scene();

		// create camera
		let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);
		camera.position.set(1,0,1).multiplyScalar(BLOCK_SIZE*10).add(new THREE.Vector3(1,1,1).multiplyScalar(300));

		//resize camera when window resizes
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});

		// create AO post processing effect
		let renderPass = new THREE.RenderPass(scene, camera);

		// Setup depth pass
		let depthMaterial = new THREE.MeshDepthMaterial();
		depthMaterial.depthPacking = THREE.RGBADepthPacking;
		depthMaterial.blending = THREE.NoBlending;
		let pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter};
		let depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

		// Setup SSAO pass
		let ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
		ssaoPass.renderToScreen = true;
		//ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
		ssaoPass.uniforms["tDepth"].value = depthRenderTarget.texture;
		ssaoPass.uniforms['size'].value.set( window.innerWidth, window.innerHeight );
		ssaoPass.uniforms['cameraNear'].value = camera.near;
		ssaoPass.uniforms['cameraFar'].value = camera.far;
		ssaoPass.uniforms['onlyAO'].value = false;
		ssaoPass.uniforms['aoClamp'].value = 0.3;
		ssaoPass.uniforms['lumInfluence'].value = 0.5;

		// Add pass to effect composer
		let effectComposer = new THREE.EffectComposer(renderer);
		effectComposer.addPass(renderPass);
		effectComposer.addPass(ssaoPass);

		// resize effects
		window.addEventListener('resize', () => {
			let width = window.innerWidth;
			let height = window.innerHeight;

			// Resize renderTargets
			ssaoPass.uniforms['size'].value.set(width, height);
			let pixelRatio = renderer.getPixelRatio();
			let newWidth  = Math.floor(width / pixelRatio) || 1;
			let newHeight = Math.floor(height / pixelRatio) || 1;
			depthRenderTarget.setSize(newWidth, newHeight);
			effectComposer.setSize(newWidth, newHeight);
		});

		// create controls
		let controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(1,0,1).multiplyScalar(BLOCK_SIZE*10);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableKeys = false;
		controls.rotateSpeed = 0.5;
		controls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		controls.mouseButtons.PAN = undefined;
		controls.mouseButtons.ZOOM = undefined;

		// create gridWalls
		let gridWalls = new GridCube(ROOM_SIZE/2, BLOCK_SIZE, 0x666666, 0x666666);
		gridWalls.position.set(1,1,1).multiplyScalar(ROOM_SIZE/2*BLOCK_SIZE);
		scene.add(gridWalls);

		// view walls
		this.$watch('view.walls', v => gridWalls.visible = v);

		let axes = new THREE.AxisHelper(BLOCK_SIZE*ROOM_SIZE);
		axes.material.depthTest = false;
		scene.add(axes);

		// create the map
		let blockManager = new VoxelBlockManager();
		blockManager.registerBlock(blocks);
		let map = new VoxelMap(blockManager);
		scene.add(map);

		// view blocks
		this.$watch('view.blocks', v => map.visible = v);

		// create edges
		let edgesGroup = new THREE.Group();
		let chunkEdges = new Map();
		map.addEventListener('chunk:built', (ev) => {
			// rebuild edges for chunk
			if(!ev.chunk.empty){
				let helper = new THREE.EdgesHelper(ev.chunk.mesh);
				helper.material.linewidth = 2;
				edgesGroup.add(helper);
				chunkEdges.set(ev.chunk, helper);
			}
			else{
				// remove helper
				let helper = chunkEdges.get(ev.chunk);
				chunkEdges.delete(ev.chunk);

				if(helper && helper.parent)
						helper.parent.remove(helper);
			}
		})
		map.addEventListener('chunk:removed', ev => {
			// remove helper
			let helper = chunkEdges.get(ev.chunk);
			chunkEdges.delete(ev.chunk);

			if(helper && helper.parent)
					helper.parent.remove(helper);
		})
		scene.add(edgesGroup);

		// view edges
		edgesGroup.visible = this.view.edges;
		this.$watch('view.edges', v => edgesGroup.visible = v);

		// create light
		scene.add(new THREE.AmbientLight(0xbbbbbb));

		// create clock
		let clock = new THREE.Clock();
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled){
				map.updateChunks();
				controls.update();

				gridWalls.updateViewingDirection(camera.getWorldDirection());
			}

			// Render depth into depthRenderTarget
			scene.overrideMaterial = depthMaterial;
			renderer.render(scene, camera, depthRenderTarget, true);
			// Render renderPass and SSAO shaderPass
			scene.overrideMaterial = null;
			effectComposer.render();

			requestAnimationFrame(update.bind(this));
		}

		// create editor tools
		let attachTool = new AttachTool(camera, map, renderer);
		attachTool.placeBlockID = 'stone';
		scene.add(attachTool);

		// make sure we dont place blocks outside of the room
		attachTool.checkPlace = (v) => {
			return !(
				v.x > ROOM_SIZE || v.x < 0 ||
				v.y > ROOM_SIZE || v.y < 0 ||
				v.z > ROOM_SIZE || v.z < 0
			);
		}

		// create a cube with inverted normals
		let wallsCube = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, ROOM_SIZE);
		for(let i = 0; i < wallsCube.faces.length; i ++){
			let face = wallsCube.faces[i];
			let temp = face.a;
			face.a = face.c;
			face.c = temp;
		}

		wallsCube.computeFaceNormals();
		wallsCube.computeVertexNormals();

		let faceVertexUvs = wallsCube.faceVertexUvs[ 0 ];
		for(let i = 0; i < faceVertexUvs.length; i ++){
			let temp = faceVertexUvs[ i ][ 0 ];
			faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
			faceVertexUvs[ i ][ 2 ] = temp;
		}

		// create invisible cube so the tools can place blocks on the edge of the room
		let wallsForTools = new THREE.Mesh(wallsCube, new THREE.MeshNormalMaterial({
			visible: false
		}));
		wallsForTools.scale.copy(map.blockSize);
		wallsForTools.position.set(ROOM_SIZE,ROOM_SIZE,ROOM_SIZE).divideScalar(2).multiply(map.blockSize);
		attachTool.intersects.push(wallsForTools);
		scene.add(wallsForTools);

		// save some stuff to vue controler
		this._renderer = renderer;
		this._keyboard = new Keyboard();

		// start
		update.call(this);

		// debug
		if(process.env.NODE_ENV == 'dev'){
			window.editorMap = map;
		}
	},
	attached(){
		//add it to my element
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

.navbar-right{
	margin-right: 0;
}

</style>
