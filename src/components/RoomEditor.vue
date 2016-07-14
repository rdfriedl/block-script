<!-- HTML -->
<template>

<div layout="column" style="height:100%;">
	<div>
		<div class="btn-group">
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
		</div>
	</div>

	<div self="size-x1" layout="row stretch-stretch">
		<div self="size-1of4">
			<tabs :active="0">
				<tab header="Blocks">
					<div layout="rows top-spread">
						<div class="block" self="size-1of8" v-for="(key, block) of blocks" @click="selectedBlockID = block.UID" :class="{active: selectedBlockID == block.UID}">
							<mesh-preview class="fix-width" :mesh="getBlockMesh(block)"></mesh-preview>
						</div>
					</div>
				</tab>
				<tab header="Options">

				</tab>
			</tabs>
		</div>
		<div self="size-3of4">
			<div v-el:canvas class="canvas-container"></div>
		</div>
	</div>
</div>

</template>

<!-- JS -->
<script>

import $ from 'jquery';
import THREE from 'three';

import MeshPreviewComponent from './editor/MeshPreview.vue';
import * as VueStrap from 'vue-strap';

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

const ROOM_SIZE = new THREE.Vector3(32,16,32);

export default {
	components: {
		dropdown: VueStrap.dropdown,
		tabs: VueStrap.tabset,
		tab: VueStrap.tab,
		meshPreview: MeshPreviewComponent
	},
	data(){return {
		selectedBlockID: 'dirt',
		blocks: blocks,
		mode: 'place',
		view: {
			edges: false,
			axes: true,
			walls: true,
			blocks: true
		}
	}},
	methods: {
		getBlockMesh(blockCls){
			let block = new blockCls();
			let mesh = new THREE.Mesh(block.geometry, block.material);
			mesh.scale.set(32,32,32);
			return () => mesh;
		}
	},
	created(){
		let editor = {};
		let modes = editor.modes = {};
		this.$watch('mode', (newValue, oldValue) => {
			if(modes[oldValue])
				modes[oldValue].exit();

			if(modes[newValue])
				modes[newValue].enter();
		});

		// create keyboard
		editor.keyboard = new Keyboard();

		// init
		createRenderer.call(this, editor);
		createScene.call(this, editor);
		createRendererEffects.call(this, editor);
		createTools.call(this, editor);
		createControls.call(this, editor);

		// set camera position
		editor.camera.position.copy(ROOM_SIZE).multiply(editor.map.blockSize);
		editor.camControls.target.set(0.5,0,0.5).multiply(editor.map.blockSize).multiply(ROOM_SIZE);

		// disable orbit controls if ctrlKey is down
		editor.camControls.enabled = true;
		editor.keyboard.register_many([
			{
				keys: 'space',
				on_keydown: () => {
					editor.camLookAt.enabled = true;
					editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.LEFT;
					editor.camControls.mouseButtons.PAN = THREE.MOUSE.MIDDLE;

					editor.attachTool.enabled = false;
				},
				on_keyup: () => {
					editor.camLookAt.enabled = false;
					editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
					editor.camControls.mouseButtons.PAN = undefined;

					editor.attachTool.enabled = true;
				},
			}
		]);

		editor.attachTool.placeBlockID = this.selectedBlockID;
		this.$watch('selectedBlockID', v => editor.attachTool.placeBlockID = v);

		// view walls
		editor.gridWalls.visible = this.view.walls;
		this.$watch('view.walls', v => editor.gridWalls.visible = v);

		// view blocks
		editor.map.visible = this.view.blocks;
		this.$watch('view.blocks', v => editor.map.visible = v);

		// view edges
		editor.mapEdges.visible = this.view.edges;
		this.$watch('view.edges', v => editor.mapEdges.visible = v);

		// create clock
		let clock = new THREE.Clock();

		// main update
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled){
				editor.map.updateChunks();
				editor.camControls.update();

				editor.gridWalls.updateViewingDirection(editor.camera.getWorldDirection());
			}

			// Render depth into depthRenderTarget
			editor.scene.overrideMaterial = editor.depthMaterial;
			editor.renderer.render(editor.scene, editor.camera, editor.depthRenderTarget, true);
			// Render renderPass and SSAO shaderPass
			editor.scene.overrideMaterial = null;
			editor.effectComposer.render();

			requestAnimationFrame(update.bind(this));
		}

		// save some stuff to vue controler
		this.editor = editor;

		// start
		update.call(this);

		// debug
		if(process.env.NODE_ENV == 'dev')
			window.editor = editor;
	},
	ready(){
		window.addEventListener('resize', Function.debounce(() => this.$emit('canvas-resize'), 150));
	},
	attached(){
		//add it to my element
		this.$els.canvas.appendChild(this.editor.renderer.domElement);
		this.editor.keyboard.listen();
		this.enabled = true;

		this.$emit('canvas-resize');
	},
	detached(){
		this.editor.keyboard.stop_listening();
		this.enabled = false;
	}
}

// create renderer
function createRenderer(editor){
	let renderer = editor.renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x333333, 1);

	// resize renderer
	this.$on('canvas-resize', () => {
		renderer.setSize(this.$els.canvas.parentElement.clientWidth, this.$els.canvas.parentElement.clientHeight);
	});
}

// create scene
function createScene(editor){
	let scene = editor.scene = new THREE.Scene();

	// create camera
	let camera = editor.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);

	//resize camera when window resizes
	this.$on('canvas-resize', () => {
		camera.aspect = this.$els.canvas.parentElement.clientWidth / this.$els.canvas.parentElement.clientHeight;
		camera.updateProjectionMatrix();
	});

	// create the map
	let blockManager = editor.blockManager = new VoxelBlockManager();
	blockManager.registerBlock(blocks);
	let map = editor.map = new VoxelMap(blockManager);
	scene.add(map);

	// create light
	scene.add(new THREE.AmbientLight(0xffffff));

	// add gridWalls
	let gridWalls = editor.gridWalls = new GridCube(ROOM_SIZE.clone().divideScalar(2), map.blockSize, 0xffffff, 0x666666);
	gridWalls.position.set(1,1,1).multiply(ROOM_SIZE).multiply(map.blockSize).divideScalar(2);
	scene.add(gridWalls);

	// create edges
	let mapEdges = editor.mapEdges = new THREE.Group();
	let chunkEdges = new Map();
	map.addEventListener('chunk:built', (ev) => {
		// remove old helper
		let helper = chunkEdges.get(ev.chunk);
		chunkEdges.delete(ev.chunk);

		if(helper && helper.parent)
				helper.parent.remove(helper);

		// build new helper
		if(!ev.chunk.empty){
			let helper = new THREE.EdgesHelper(ev.chunk.mesh);
			helper.material.linewidth = 2;
			mapEdges.add(helper);
			chunkEdges.set(ev.chunk, helper);
		}
	})
	map.addEventListener('chunk:removed', ev => {
		// remove helper
		let helper = chunkEdges.get(ev.chunk);
		chunkEdges.delete(ev.chunk);

		if(helper && helper.parent)
				helper.parent.remove(helper);
	})
	scene.add(mapEdges);

	// add axis helper
	let axes = editor.axes = new THREE.AxisHelper(map.blockSize.clone().multiply(ROOM_SIZE));
	axes.material.depthTest = false;
	scene.add(axes);
}

// create post processing effects
function createRendererEffects(editor){
	// create AO post processing effect
	let renderPass = new THREE.RenderPass(editor.scene, editor.camera);

	// Setup depth pass
	let depthMaterial = editor.depthMaterial = new THREE.MeshDepthMaterial();
	depthMaterial.depthPacking = THREE.RGBADepthPacking;
	depthMaterial.blending = THREE.NoBlending;
	let pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter};
	let depthRenderTarget = editor.depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

	// Setup SSAO pass
	let ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
	ssaoPass.renderToScreen = true;
	//ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
	ssaoPass.uniforms["tDepth"].value = depthRenderTarget.texture;
	ssaoPass.uniforms['size'].value.set(window.innerWidth, window.innerHeight);
	ssaoPass.uniforms['cameraNear'].value = editor.camera.near;
	ssaoPass.uniforms['cameraFar'].value = editor.camera.far;
	ssaoPass.uniforms['onlyAO'].value = false;
	ssaoPass.uniforms['aoClamp'].value = 0.3;
	ssaoPass.uniforms['lumInfluence'].value = 0.5;

	// Add pass to effect composer
	let effectComposer = editor.effectComposer = new THREE.EffectComposer(editor.renderer);
	effectComposer.addPass(renderPass);
	effectComposer.addPass(ssaoPass);

	// resize effects
	this.$on('canvas-resize', () => {
		let width = this.$els.canvas.parentElement.clientWidth;
		let height = this.$els.canvas.parentElement.clientHeight;

		// Resize renderTargets
		ssaoPass.uniforms['size'].value.set(width, height);
		let pixelRatio = editor.renderer.getPixelRatio();
		let newWidth  = Math.floor(width / pixelRatio) || 1;
		let newHeight = Math.floor(height / pixelRatio) || 1;
		depthRenderTarget.setSize(newWidth, newHeight);
		effectComposer.setSize(newWidth, newHeight);
	});
}

// create editor tools
function createTools(editor){
	// create a cube with inverted normals
	let wallsCube = new THREE.BoxGeometry(ROOM_SIZE.x, ROOM_SIZE.y, ROOM_SIZE.z);
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
	let roomWalls = editor.roomWalls = new THREE.Mesh(wallsCube, new THREE.MeshNormalMaterial({
		visible: false
	}));
	roomWalls.scale.copy(editor.map.blockSize);
	roomWalls.position.set(ROOM_SIZE.x, ROOM_SIZE.y, ROOM_SIZE.z).divideScalar(2).multiply(editor.map.blockSize);
	editor.scene.add(roomWalls);

	// create editor tools
	let attachTool = editor.attachTool = new AttachTool(editor.camera, editor.map, editor.renderer);
	attachTool.intersects.push(roomWalls);
	editor.scene.add(attachTool);

	// make sure we dont place blocks outside of the room
	attachTool.checkPlace = (v) => {
		return !(
			v.x > ROOM_SIZE.x || v.x < 0 ||
			v.y > ROOM_SIZE.y || v.y < 0 ||
			v.z > ROOM_SIZE.z || v.z < 0
		);
	}
}

// create camera controls
function createControls(editor){
	// create controls
	let camControls = editor.camControls = new THREE.OrbitControls(editor.camera, editor.renderer.domElement);
	camControls.enableDamping = true;
	camControls.dampingFactor = 0.25;
	camControls.enableKeys = false;
	camControls.rotateSpeed = 0.5;
	camControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
	camControls.mouseButtons.PAN = undefined;
	camControls.mouseButtons.ZOOM = undefined;
	camControls.enabled = false;

	// look at control
	let camLookAt = editor.camLookAt = {
		enabled: false,
		mouseButtons: {
			LOOK: THREE.MOUSE.RIGHT
		}
	}
	editor.renderer.domElement.addEventListener('mousedown', event => {
		if(camLookAt.enabled && event.button == camLookAt.mouseButtons.LOOK){
			let raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(new THREE.Vector2(
				(event.offsetX / editor.renderer.domElement.clientWidth) * 2 - 1,
				- (event.offsetY / editor.renderer.domElement.clientHeight) * 2 + 1), editor.camera);

			let intersects = raycaster.intersectObjects([editor.map, editor.roomWalls], true);

			if(intersects[0]){
				camControls.target.copy(intersects[0].point);
			}
		}
	})
}

</script>

<style scoped>

.navbar-right{
	margin-right: 0;
}

.block{
	box-sizing: border-box;
	background: rgba(0,0,0,0.5);
	border: 2px solid grey;
	margin: 5px;
	cursor: pointer;
}

.block.active{
	border-color: black;
}

</style>
