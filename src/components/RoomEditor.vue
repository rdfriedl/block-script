<!-- HTML -->
<template>

<div layout="column" style="height:100%;">
	<div>
		<div class="btn-group">
			<a v-link="'/menu'" class="btn btn-info"><i class="fa fa-arrow-left"></i> Back</a>
			<dropdown>
				<a class="dropdown-toggle btn btn-default" data-toggle="dropdown"><i class="fa fa-file"></i> File</a>
				<ul slot="dropdown-menu" class="dropdown-menu">
					<li><a href="#" @click="importFile"><i class="fa fa-upload"></i> Load from file</a></li>
					<li><a href="#" @click="exportFile"><i class="fa fa-download"></i> Export to file</a></li>
				</ul>
			</dropdown>
			<dropdown>
				<a class="dropdown-toggle btn btn-default" data-toggle="dropdown"><i class="fa fa-eye"></i> View</a>
				<ul slot="dropdown-menu" class="dropdown-menu">
					<li><a @click="view.edges = !view.edges">Edges <i class="fa fa-check" v-show="view.edges"></i></a></li>
					<li><a @click="view.blocks = !view.blocks">Blocks <i class="fa fa-check" v-show="view.blocks"></i></a></li>
					<li><a @click="view.walls = !view.walls">Walls <i class="fa fa-check" v-show="view.walls"></i></a></li>
				</ul>
			</dropdown>
			<dropdown>
				<a class="dropdown-toggle btn btn-default" data-toggle="dropdown"><i class="fa fa-pencil"></i> Edit</a>
				<ul slot="dropdown-menu" class="dropdown-menu">
					<li><a @click="clearRoom"><i class="fa fa-trash"></i> Clear Room</a></li>
					<li><a @click="shiftBlocks.open = true"><i class="fa fa-arrows-alt"></i> Shift Blocks</a></li>
				</ul>
			</dropdown>
		</div>

		<!-- tools -->
		<div class="btn-group padding-right-10">
			<button type="button" class="btn btn-default" :class="{active: mode == 'place-blocks'}" @click="mode = 'place-blocks'"><i class="fa fa-cube"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'pick-block'}" @click="mode = 'pick-block'"><i class="fa fa-eyedropper"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'place-objects'}" @click="mode = 'place-objects'"><i class="fa fa-lightbulb-o"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'camera-controls'}" @click="mode = 'camera-controls'"><i class="fa fa-hand-paper-o"></i></button>
		</div>

		<!-- attachTool fill type -->
		<dropdown v-show="mode == 'place-blocks'">
			<a class="dropdown-toggle btn btn-default" data-toggle="dropdown">Fill Type</a>
			<ul slot="dropdown-menu" class="dropdown-menu">
				<li><a @click="placeBlocks.fillType = 'solid'">Solid <i class="fa fa-check" v-show="placeBlocks.fillType == 'solid'"></i></a></li>
				<li><a @click="placeBlocks.fillType = 'hollow'">Hollow <i class="fa fa-check" v-show="placeBlocks.fillType == 'hollow'"></i></a></li>
				<li><a @click="placeBlocks.fillType = 'frame'">Frame <i class="fa fa-check" v-show="placeBlocks.fillType == 'frame'"></i></a></li>
			</ul>
		</dropdown>

		<div class="pull-right" style="margin-right: 10px;" v-show="targetBlock.enabled">
			<h5>XYZ: {{targetBlock.x}}, {{targetBlock.y}}, {{targetBlock.z}}</h5>
		</div>
	</div>

	<div self="size-x1" layout="row stretch-stretch">
		<div self="size-1of4" layout="column top-stretch">
			<div class="btn-group no-margin">
				<button type="button" class="btn btn-default" @click="tab='blocks'"><i class="fa fa-cube"></i> Blocks</button>
				<button type="button" class="btn btn-default" @click="tab='models'">Models</button>
				<button type="button" class="btn btn-default" @click="tab='doors'">Doors</button>
			</div>

			<!-- blocks -->
			<div v-show="tab=='blocks'" self="size-x1" layout="rows top-spread" style="overflow: auto">
				<div class="block" self="size-1of8" v-for="block in blocks" @click="placeBlocks.selected = block.id" :class="{active: placeBlocks.selected == block.id}">
					<div v-if="block.loaded">
						<mesh-preview class="fix-width" :mesh="block.mesh"></mesh-preview>
					</div>
				</div>
			</div>

			<!-- models -->
			<div v-show="tab=='models'" self="size-x1" layout="rows top-spread">
				<div class="model" self="size-1of8" v-for="(index, model) in models">
					<mesh-preview class="fix-width" v-if="model.loaded" :mesh="model.mesh"></mesh-preview>
				</div>
			</div>

			<!-- doors -->
			<div v-show="tab=='doors'" class="panel panel-default" v-for="(axis_id, axis) in doors">
				<div class="panel-heading">
					<h3 class="panel-title">{{axis.title}}</h3>
				</div>
				<div class="panel-body">
					<div class="input-group">
						<div class="input-group-addon">Positive</div>
						<select class="form-control" v-model="axis.sides[0]">
							<option v-for="type in doorTypes[axis_id]" :value="type">{{type}}</option>
						</select>
					</div>
					<div class="input-group">
						<div class="input-group-addon">Negative</div>
						<select class="form-control" v-model="axis.sides[1]">
							<option v-for="type in doorTypes[axis_id]" :value="type">{{type}}</option>
						</select>
					</div>
				</div>
			</div>
		</div>
		<div self="size-3of4">
			<div v-el:canvas class="canvas-container"></div>
		</div>
	</div>

	<!-- shift blocks modal -->
	<modal :show.sync="shiftBlocks.open" effect="fade">
		<div slot="modal-header" class="modal-header">
			<h4 class="modal-title">Shift Blocks</h4>
		</div>
		<div slot="modal-body" class="modal-body">
			<div class="input-group">
				<div class="input-group-addon">X</div>
				<input type="number" class="form-control" v-model="shiftBlocks.dir.x">
				<div class="input-group-btn">
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.x -= 1"><i class="fa fa-chevron-left"></i></button>
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.x += 1"><i class="fa fa-chevron-right"></i></button>
				</div>
			</div>
			<div class="input-group">
				<div class="input-group-addon">Y</div>
				<input type="number" class="form-control" v-model="shiftBlocks.dir.y">
				<div class="input-group-btn">
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.y -= 1"><i class="fa fa-chevron-left"></i></button>
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.y += 1"><i class="fa fa-chevron-right"></i></button>
				</div>
			</div>
			<div class="input-group">
				<div class="input-group-addon">Z</div>
				<input type="number" class="form-control" v-model="shiftBlocks.dir.z">
				<div class="input-group-btn">
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.z -= 1"><i class="fa fa-chevron-left"></i></button>
					<button type="button" class="btn btn-default" @click="shiftBlocks.dir.z += 1"><i class="fa fa-chevron-right"></i></button>
				</div>
			</div>
		</div>
		<div slot="modal-footer" class="modal-footer">
			<button type="button" class="btn btn-default" @click="shiftBlocks.open = false">Cancel</button>
			<button type="button" class="btn btn-success" @click="loopBlocks(shiftBlocks.dir)">Ok</button>
		</div>
	</modal>
</div>

</template>

<!-- JS -->
<script>

import THREE from 'three';
import FileSaver from 'file-saver';

import MeshPreviewComponent from './editor/MeshPreview.vue';
import * as VueStrap from 'vue-strap';
import BSDropdown from './bootstrap/dropdown.vue';

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
import MODELS from '../js/models.js';
import DOOR_TYPES from '../data/doorTypes.json';

import VoxelMap from '../js/voxel/VoxelMap.js';
import VoxelBlockManager from '../js/voxel/VoxelBlockManager.js';
import VoxelSelection from '../js/voxel/VoxelSelection.js';

import AttachTool from '../js/editor/AttachTool.js';
import PickBlockTool from '../js/editor/PickBlockTool.js';

const ROOM_SIZE = new THREE.Vector3(32,16,32);

export default {
	components: {
		dropdown: BSDropdown,
		modal: VueStrap.modal,
		tooltip: VueStrap.tooltip,
		tabs: VueStrap.tabset,
		tab: VueStrap.tab,
		meshPreview: MeshPreviewComponent
	},
	data(){return {
		placeBlocks: {
			selected: 'dirt',
			fillType: 'solid'
		},
		tab: 'blocks',
		blocks: [],
		models: [],
		mode: '', //place-blocks, place-objects, camera-controls
		prevMode: '',
		view: {
			edges: false,
			axes: true,
			walls: true,
			blocks: true
		},
		shiftBlocks: {
			open: false,
			dir: new THREE.Vector3
		},
		doors: {
			x: {
				title: 'X axis',
				sides: ['none','none']
			},
			y: {
				title: 'Y axis',
				sides: ['none','none']
			},
			z: {
				title: 'Z axis',
				sides: ['none','none']
			},
			w: {
				title: 'Time axis',
				sides: ['none','none']
			}
		},
		doorTypes: DOOR_TYPES,
		targetBlock: {
			enabled: false,
			x: 0, y: 0, z: 0
		}
	}},
	methods: {
		clearRoom(){
			if(confirm('are you sure you want to reset the room?')){
				this.editor.map.clearBlocks();
			}
		},
		exportFile(){
			let selection = new VoxelSelection();
			selection.copyFrom(this.editor.map, new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1).multiply(ROOM_SIZE));
			let json = {
				selection: selection.toJSON(),
				doors: {}
			}

			// doors
			for(let i in this.doors){
				json.doors[i] = {
					p: this.doors[i].sides[0] != 'none'? this.doors[i].sides[0] : false,
					n: this.doors[i].sides[1] != 'none'? this.doors[i].sides[1] : false
				}
			}

			let blob = new Blob([JSON.stringify(json)], {type: 'text/plain'});
			FileSaver.saveAs(blob, 'room.json');
		},
		importFile(){
			let $input = $('<input>');
			$input.attr('type','file').on('change', event => {
				if(event.target.files.length){
					JSON.fromBlob(event.target.files[0]).then(json => {
						if(json.selection){
							let selection = new VoxelSelection();
							selection.fromJSON(json.selection);
							this.editor.map.clearBlocks();
							selection.addTo(this.editor.map);
						}

						if(json.doors){
							for(let i in json.doors){
								this.doors[i].sides = [
									json.doors[i].p || 'none', json.doors[i].n || 'none'
								]
							}
						}
					}).catch(err => {
						console.warn('failed to load room', err);
					})
				}
			}).trigger('click');
		},
		loopBlocks(dir){
			let offset = new THREE.Vector3().copy(dir);
			let selection = new VoxelSelection();
			let selection2 = new VoxelSelection();

			// move all the blocks from the map into a new selection
			selection.copyFrom(this.editor.map, new THREE.Vector3(), ROOM_SIZE, false);

			// move blocks
			selection.listBlocks().forEach(block => {
				let pos = block.position.clone().add(offset);
				block.parent.removeBlock(block, false);

				// loop
				pos.map((v, axis) => {
					while(v >= ROOM_SIZE[axis]) v -= ROOM_SIZE[axis];
					while(v < 0) v += ROOM_SIZE[axis];
					return v;
				})

				// add to the new selection
				selection2.setBlock(block, pos);
			})

			// add back to map
			selection2.addTo(this.editor.map, new THREE.Vector3(), false);

			this.shiftBlocks.dir = new THREE.Vector3();
			this.shiftBlocks.open = false;
		}
	},
	created(){
		let editor = {};
		let modes = editor.modes = {};
		this.$watch('mode', (newValue, oldValue) => {
			this.prevMode = oldValue;
			if(modes[oldValue])
				modes[oldValue].exit();

			if(modes[newValue])
				modes[newValue].enter();
		});

		// create modes
		createModes.call(this, editor, modes);

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

		// set up keybindings
		editor.keyboard.register_many([
			{
				keys: 'space',
				on_keydown: () => this.mode = 'camera-controls',
				on_keyup: () => this.mode = this.prevMode
			},
			{
				keys: 'alt',
				on_keydown: () => this.mode = 'pick-block',
				on_keyup: () => this.mode = this.prevMode
			}
		]);

		editor.attachTool.placeBlockID = this.placeBlocks.selected;
		this.$watch('placeBlocks.selected', v => editor.attachTool.placeBlockID = v);
		editor.attachTool.fillType = this.placeBlocks.fillType;
		this.$watch('placeBlocks.fillType', v => editor.attachTool.fillType = v);

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

		// default mode
		this.mode = 'place-blocks';

		// get models
		this.models = MODELS.listModels().map(id => {
			let model = {
				id: id,
				loaded: false,
				mesh: () => mesh
			}

			// load models
			let mesh = MODELS.getMesh(model.id, () => {
				model.loaded = true;
			});

			return model;
		})

		// get blocks
		for(let i in blocks){
			let types = blocks[i].prototype.properties && blocks[i].prototype.properties.TYPES;
			function addBlock(type){
				let id = blocks[i].UID+'?type='+type;
				let block = this.editor.map.blockManager.createBlock(id);
				if(!block) return;

				let mesh = new THREE.Mesh(block.geometry, block.material);
				mesh.scale.set(32,32,32);

				let data = {
					id: id,
					loaded: false,
					mesh: () => mesh
				};

				this.blocks.push(data);
			}
			if(types)
				types.forEach(addBlock.bind(this));
			else
				addBlock.call(this,'normal');
		}

		THREE.DefaultLoadingManager.onLoad = () => {
			setTimeout(() => {
				this.blocks.forEach(block => block.loaded = true);
			}, 50);
		}
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
	let map = editor.map = new VoxelMap();
	map.blockManager.registerBlock(blocks);
	map.blockManager.usePool = true;
	map.useNeighborCache = false;
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

	// display info about attach tool
	window.addEventListener('mousemove', () => {
		this.targetBlock.enabled = attachTool.enabled;
		this.targetBlock.x = attachTool.end? attachTool.end.target.x : 0;
		this.targetBlock.y = attachTool.end? attachTool.end.target.y : 0;
		this.targetBlock.z = attachTool.end? attachTool.end.target.z : 0;
	})

	// create editor tools
	let pickBlockTool = editor.pickBlockTool = new PickBlockTool(editor.camera, editor.map, editor.renderer);
	pickBlockTool.onPick = (block) => {
		this.placeBlocks.selected = VoxelBlockManager.createID(block);
	}
	editor.scene.add(pickBlockTool);
}

// create camera controls
function createControls(editor){
	// create controls
	let camControls = editor.camControls = new THREE.OrbitControls(editor.camera, editor.renderer.domElement);
	camControls.enableDamping = true;
	camControls.dampingFactor = 0.25;
	camControls.enableKeys = false;
	camControls.rotateSpeed = 0.5;
	camControls.mouseButtons.ORBIT = undefined;
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

// create the editor modes
function createModes(editor, modes) {
	modes['place-blocks'] = {
		enter(){
			editor.attachTool.enabled = true;

			editor.camControls.enabled = true;
			editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.attachTool.enabled = false;

			editor.camControls.enabled = false;
			editor.camControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['pick-block'] = {
		enter(){
			editor.pickBlockTool.enabled = true;

			editor.camControls.enabled = true;
			editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.pickBlockTool.enabled = false;

			editor.camControls.enabled = false;
			editor.camControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['place-objects'] = {
		enter(){
			editor.camControls.enabled = true;
			editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.camControls.enabled = false;
			editor.camControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['camera-controls'] = {
		enter(){
			editor.camControls.enabled = true;
			editor.camControls.mouseButtons.ORBIT = THREE.MOUSE.LEFT;
			editor.camControls.mouseButtons.PAN = THREE.MOUSE.RIGHT;

			editor.camLookAt.enabled = true;
			editor.camLookAt.mouseButtons.LOOK = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.camControls.enabled = false;
			editor.camControls.mouseButtons.ORBIT = undefined;
			editor.camControls.mouseButtons.PAN = undefined;

			editor.camLookAt.enabled = true;
			editor.camLookAt.mouseButtons.LOOK = undefined;
		}
	}
}

</script>

<style scoped>

.navbar-right{
	margin-right: 0;
}

.block, .model{
	box-sizing: border-box;
	background: rgba(0,0,0,0.5);
	border: 2px solid grey;
	margin: 5px;
	cursor: pointer;
	padding: 2px;
}

.block.active, .model.active{
	border-color: black;
}

</style>
