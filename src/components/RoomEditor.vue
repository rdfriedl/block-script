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
					<li><a @click="view.axes = !view.axes">Axes <i class="fa fa-check" v-show="view.axes"></i></a></li>
					<li><a @click="view.walls = !view.walls">Walls <i class="fa fa-check" v-show="view.walls"></i></a></li>
					<li><a @click="view.doors = !view.doors">Doors <i class="fa fa-check" v-show="view.doors"></i></a></li>
					<li role="separator" class="divider"></li>
					<li><a @click="changeTime.open = true">Change Time</a></li>
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

		<!-- undo / redo -->
		<div class="btn-group">
			<button type="button" class="btn btn-default" @click="undo" :disabled="!hasUndo"><i class="fa fa-undo"></i></button>
			<button type="button" class="btn btn-default" @click="redo" :disabled="!hasRedo"><i class="fa fa-repeat"></i></button>
		</div>

		<!-- tools -->
		<div class="btn-group padding-right-10">
			<button type="button" class="btn btn-default" :class="{active: mode == 'place-blocks'}" @click="mode = 'place-blocks'"><i class="fa fa-cube"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'pick-block'}" @click="mode = 'pick-block'"><i class="fa fa-eyedropper"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'place-objects'}" @click="mode = 'place-objects'"><i class="fa fa-lightbulb-o"></i></button>
			<button type="button" class="btn btn-default" :class="{active: mode == 'camera-controls'}" @click="mode = 'camera-controls'" v-show="cameraMode != 'first-person'"><i class="fa fa-hand-paper-o"></i></button>
		</div>

		<!-- camera type -->
		<dropdown>
			<a class="dropdown-toggle btn btn-default" data-toggle="dropdown">Camera</a>
			<ul slot="dropdown-menu" class="dropdown-menu">
				<li><a @click="cameraMode = 'orbit'">Orbit <i class="fa fa-check" v-show="cameraMode == 'orbit'"></i></a></li>
				<li><a @click="cameraMode = 'first-person'">First Person <i class="fa fa-check" v-show="cameraMode == 'first-person'"></i></a></li>
			</ul>
		</dropdown>

		<!-- attachTool fill type -->
		<dropdown v-show="mode == 'place-blocks'">
			<a class="dropdown-toggle btn btn-default" data-toggle="dropdown">Fill Type</a>
			<ul slot="dropdown-menu" class="dropdown-menu">
				<li><a @click="placeBlocks.fillType = 'solid'">Solid <i class="fa fa-check" v-show="placeBlocks.fillType == 'solid'"></i></a></li>
				<li><a @click="placeBlocks.fillType = 'hollow'">Hollow <i class="fa fa-check" v-show="placeBlocks.fillType == 'hollow'"></i></a></li>
				<li><a @click="placeBlocks.fillType = 'frame'">Frame <i class="fa fa-check" v-show="placeBlocks.fillType == 'frame'"></i></a></li>
			</ul>
		</dropdown>

		<!-- camera type -->
		<dropdown v-show="cameraMode == 'first-person'">
			<a class="dropdown-toggle btn btn-default" data-toggle="dropdown">Control Type</a>
			<ul slot="dropdown-menu" class="dropdown-menu">
				<li><a @click="firtsPersonControlType = 'fly'">Fly <i class="fa fa-check" v-show="firtsPersonControlType == 'fly'"></i></a></li>
				<li><a @click="firtsPersonControlType = 'mc'">MC <i class="fa fa-check" v-show="firtsPersonControlType == 'mc'"></i></a></li>
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
						<tooltip placement="right" :content="block.name">
							<mesh-preview class="fix-width" :mesh="block.mesh"></mesh-preview>
						</tooltip>
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
		<div self="size-3of4" style="position: relative">
			<div v-el:canvas class="canvas-container"></div>
			<img class="first-person-pointer" src="../res/img/pointer.png" height="32" width="32" v-show="cameraMode == 'first-person' && hasPointerLock"/>
			<div layout="row center-center" class="pointer-lock-overlay" v-show="cameraMode == 'first-person' && !hasPointerLock" @click="requestPointerLock">
				<h1>Click to enable Pointer Lock</h1>
			</div>
		</div>
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

<!-- change time modal -->
<modal :show.sync="changeTime.open" effect="fade">
	<div slot="modal-header" class="modal-header">
		<h4 class="modal-title">Change time</h4>
	</div>
	<div slot="modal-body" class="modal-body">
		<div class="input-group">
			<div class="input-group-addon">Time</div>
			<select class="form-control" v-model="changeTime.time">
				<option value="0">1</option>
				<option value="1">2</option>
				<option value="2">3</option>
				<option value="3">4</option>
				<option value="4">5</option>
			</select>
		</div>
	</div>
	<div slot="modal-footer" class="modal-footer">
		<button type="button" class="btn btn-default" @click="changeTime.open = false">Cancel</button>
		<button type="button" class="btn btn-success" @click="setTime(changeTime.time)">Ok</button>
	</div>
</modal>

</template>

<!-- JS -->
<script>

import THREE from 'three';
import FileSaver from 'file-saver';
import UndoManager from 'undo-manager';

import MeshPreviewComponent from './editor/MeshPreview.vue';
import * as VueStrap from 'vue-strap';
import BSDropdown from './bootstrap/dropdown.vue';

// three plugins
import 'imports?THREE=three!../lib/threejs/controls/OrbitControls.js';
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';
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
import DoorHelper from '../js/editor/DoorHelper.js';

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
		cameraMode: '',
		hasPointerLock: false,
		firtsPersonControlType: 'mc',
		view: {
			edges: false,
			axes: true,
			walls: true,
			blocks: true,
			doors: true
		},
		shiftBlocks: {
			open: false,
			dir: new THREE.Vector3
		},
		changeTime: {
			open: false,
			time: 2
		},
		roomTime: 2,
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
		},
		hasUndo: false,
		hasRedo: false
	}},
	methods: {
		clearRoom(){
			if(confirm('are you sure you want to reset the room?')){
				let selection = new VoxelSelection();

				this.editor.undoManager.add({
					redo: () => {
						selection.copyFrom(this.editor.map, new THREE.Vector3(), ROOM_SIZE, false);
					},
					undo: () => {
						selection.addTo(this.editor.map, new THREE.Vector3(), false);
					}
				})

				// run command
				this.editor.undoManager.getCommands()[this.editor.undoManager.getIndex()].redo();
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

							// add the blocks to the map
							selection.addTo(this.editor.map);
						}

						if(json.doors){
							for(let i in json.doors){
								this.doors[i].sides = [
									json.doors[i].p || 'none', json.doors[i].n || 'none'
								]
							}
						}

						// clear commands since we loaded a new file
						this.editor.undoManager.clear();
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
		},
		setTime(time){
			this.roomTime = parseInt(time);
			this.changeTime.open = false;
		},
		requestPointerLock: function(){
			this.editor.renderer.domElement.requestPointerLock();
		},
		exitPointerLock: function(){
			document.exitPointerLock();
		},

		// undo / redo
		undo(){
			this.editor.undoManager.undo();
		},
		redo(){
			this.editor.undoManager.redo();
		}
	},
	created(){
		let editor = {
			updates: [] // functions to call on update
		};
		let modes = editor.modes = {};
		this.$watch('mode', (newValue, oldValue) => {
			this.prevMode = oldValue;
			if(modes[oldValue])
				modes[oldValue].exit();

			if(modes[newValue])
				modes[newValue].enter();
		});

		// camera modes
		let cameraModes = editor.cameraModes = {};
		this.$watch('cameraMode', (newValue, oldValue) => {
			this.prevMode = oldValue;
			if(cameraModes[oldValue])
				cameraModes[oldValue].exit();

			if(cameraModes[newValue])
				cameraModes[newValue].enter();
		});

		// create keyboard
		editor.keyboard = new Keyboard();

		// create undo manager
		editor.undoManager = new UndoManager();
		editor.undoManager.setCallback(() => {
			this.hasUndo = editor.undoManager.hasUndo();
			this.hasRedo = editor.undoManager.hasRedo();
		})
		editor.undoManager.setLimit(20);

		// undo / redo keys
		editor.keyboard.register_many([
			{
				keys: 'meta z',
				on_keydown: this.undo
			},
			{
				keys: 'meta y',
				on_keydown: this.redo
			},
			{
				keys: 'meta shift y',
				on_keydown: this.redo
			}
		])

		// init
		createRenderer.call(this, editor);
		createScene.call(this, editor);
		createControls.call(this, editor);
		createTools.call(this, editor);
		createRendererEffects.call(this, editor);

		// create modes
		createModes.call(this, editor, modes);
		createCameraModes.call(this, editor, cameraModes);

		// set camera position
		editor.orbitCam.position.copy(ROOM_SIZE).multiply(editor.map.blockSize);
		editor.orbitControls.target.set(0.5,0,0.5).multiply(editor.map.blockSize).multiply(ROOM_SIZE);

		// create clock
		let clock = new THREE.Clock();

		// main update
		function update(){
			let dtime = clock.getDelta();
			if(this.enabled){
				editor.map.updateChunks();
				editor.orbitControls.update();

				// call updates
				this.editor.updates.forEach(fn => {
					if(Function.isFunction(fn))
						fn(dtime);
				})

				// Render depth into depthRenderTarget
				if(editor.activeCam){
					editor.scene.overrideMaterial = editor.depthMaterial;
					editor.renderer.render(editor.scene, editor.activeCam, editor.depthRenderTarget, true);
					// Render renderPass and SSAO shaderPass
					editor.scene.overrideMaterial = null;
					editor.renderPass.camera = editor.activeCam
					editor.effectComposer.render();
				}
			}

			requestAnimationFrame(update.bind(this));
		}

		// save some stuff to vue controler
		this.editor = editor;

		// start
		update.call(this);

		// listen for pointer lock change
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', () => {
			this.hasPointerLock = !!document.pointerLockElement;
		});

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
				let block = this.editor.map.blockManager.createBlock(type? blocks[i].UID+'?type='+type : blocks[i].UID);
				if(!block) return;

				let mesh = new THREE.Mesh(block.geometry, block.material);
				mesh.scale.set(32,32,32);

				let data = {
					name: block.id,
					id: VoxelBlockManager.createID(block),
					loaded: false,
					mesh: () => mesh
				};

				this.blocks.push(data);
			}
			if(types)
				types.forEach(addBlock.bind(this));
			else
				addBlock.call(this);
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

	// create the map
	let map = editor.map = new VoxelMap();
	map.blockManager.registerBlock(blocks);
	map.blockManager.usePool = true;
	map.useNeighborCache = false;
	scene.add(map);

	// view blocks
	editor.map.visible = this.view.blocks;
	this.$watch('view.blocks', v => editor.map.visible = v);

	// change the blocks time if the room time changes
	map.time = this.roomTime;
	this.$watch('roomTime', time => {
		map.time = time;
		map.listChunks().forEach(chunk => chunk.needsBuild = true);
	})

	// create light
	scene.add(new THREE.AmbientLight(0xffffff));

	// add gridWalls
	let gridWalls = editor.gridWalls = new GridCube(ROOM_SIZE.clone().divideScalar(2), map.blockSize, 0xffffff, 0x666666);
	gridWalls.position.set(1,1,1).multiply(ROOM_SIZE).multiply(map.blockSize).divideScalar(2);
	scene.add(gridWalls);

	// update the grid walls
	editor.updates.push(() => {
		if(editor.activeCam == editor.orbitCam)
			gridWalls.updateViewingDirection(gridWalls.position.clone().sub(editor.activeCam.getWorldPosition()));
		else
			gridWalls.updateViewingDirection();
	})

	// view grid walls
	editor.gridWalls.visible = this.view.walls;
	this.$watch('view.walls', v => editor.gridWalls.visible = v);

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

	// view edges
	editor.mapEdges.visible = this.view.edges;
	this.$watch('view.edges', v => editor.mapEdges.visible = v);

	// add axis helper
	let axes = editor.axes = new THREE.AxisHelper(map.blockSize.clone().multiply(ROOM_SIZE));
	// axes.material.depthTest = false;
	scene.add(axes);
	axes.visible = this.view.axes;

	// update axes helper
	this.$watch('view.axes', v => axes.visible = v);

	// door helper
	let doorHelper = editor.doorHelper = new DoorHelper(map, ROOM_SIZE);
	scene.add(doorHelper);
	doorHelper.visible = this.view.doors;
	doorHelper.scale.copy(map.blockSize);
	doorHelper.position.copy(ROOM_SIZE).divideScalar(2).multiply(map.blockSize);

	// update door helper
	this.$watch('view.doors', v => doorHelper.visible = v);
	this.$watch('doors', doors => {
		doorHelper.doors.x = doors.x.sides;
		doorHelper.doors.y = doors.y.sides;
		doorHelper.doors.z = doors.z.sides;
		doorHelper.doors.w = doors.w.sides;
		doorHelper.update();
	}, {deep: true})
}

// create post processing effects
function createRendererEffects(editor){
	// create AO post processing effect
	let renderPass = editor.renderPass = new THREE.RenderPass(editor.scene, editor.orbitCam);

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
	ssaoPass.uniforms['cameraNear'].value = editor.orbitCam.near;
	ssaoPass.uniforms['cameraFar'].value = editor.orbitCam.far;
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
	let attachTool = editor.attachTool = new AttachTool(editor.orbitCam, editor.map, editor.renderer, editor.undoManager);
	attachTool.intersects.push(roomWalls);
	editor.scene.add(attachTool);

	// if camera changes update the tool
	this.$watch('cameraMode', () => attachTool.camera = this.editor.activeCam);

	// make sure we dont place blocks outside of the room
	attachTool.checkPlace = (v) => {
		return !(
			v.x >= ROOM_SIZE.x || v.x < 0 ||
			v.y >= ROOM_SIZE.y || v.y < 0 ||
			v.z >= ROOM_SIZE.z || v.z < 0
		);
	}

	// sync with vue
	editor.attachTool.placeBlockID = this.placeBlocks.selected;
	this.$watch('placeBlocks.selected', v => editor.attachTool.placeBlockID = v);
	editor.attachTool.fillType = this.placeBlocks.fillType;
	this.$watch('placeBlocks.fillType', v => editor.attachTool.fillType = v);

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

	// if camera changes update the tool
	this.$watch('cameraMode', () => pickBlockTool.camera = this.editor.activeCam);

	// update the attachTool
	editor.updates.push(() => attachTool.update());
}

// create camera controls
function createControls(editor){
	// create camera
	let orbitCam = editor.orbitCam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);
	let firstPersonCam = editor.firstPersonCam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);

	// add the cameras to the scene
	editor.scene.add(orbitCam, firstPersonCam);

	//resize camera when window resizes
	this.$on('canvas-resize', () => {
		orbitCam.aspect = firstPersonCam.aspect = this.$els.canvas.parentElement.clientWidth / this.$els.canvas.parentElement.clientHeight;
		orbitCam.updateProjectionMatrix();
		firstPersonCam.updateProjectionMatrix();
	});

	// create controls
	let orbitControls = editor.orbitControls = new THREE.OrbitControls(orbitCam, editor.renderer.domElement);
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.25;
	orbitControls.enableKeys = false;
	orbitControls.rotateSpeed = 0.5;
	orbitControls.mouseButtons.ORBIT = undefined;
	orbitControls.mouseButtons.PAN = undefined;
	orbitControls.mouseButtons.ZOOM = undefined;
	orbitControls.enabled = false;

	// look at control
	let camLookAt = editor.camLookAt = {
		enabled: false,
		mousePosition: true,
		mouseButtons: {
			LOOK: THREE.MOUSE.RIGHT
		}
	}
	editor.renderer.domElement.addEventListener('mousedown', event => {
		if(camLookAt.enabled && event.button == camLookAt.mouseButtons.LOOK){
			let raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(new THREE.Vector2(
				(event.offsetX / editor.renderer.domElement.clientWidth) * 2 - 1,
				- (event.offsetY / editor.renderer.domElement.clientHeight) * 2 + 1), this.editor.orbitCam);

			let intersects = raycaster.intersectObjects([editor.map, editor.roomWalls], true);

			if(intersects[0]){
				orbitControls.target.copy(intersects[0].point);
			}
		}
	})

	let pointerLockControls = editor.pointerLockControls = new THREE.PointerLockControls(firstPersonCam);
	pointerLockControls.enabled = false;
	editor.scene.add(pointerLockControls.getObject());

	pointerLockControls.movement = {
		SPEED: 3,
		up: false,
		right: false,
		left: false,
		forward: false,
		back: false,
		down: false
	}

	// update movement
	editor.updates.push(() => {
		if(!editor.activeCam || pointerLockControls.enabled == false)
			return;

		let move = pointerLockControls.movement;
		let velocity = new THREE.Vector3();

		if(move.forward && !move.back)
			velocity.z = -move.SPEED;
		else if(move.back && !move.forward)
			velocity.z = move.SPEED
		else
			velocity.z = 0;

		if(move.right && !move.left)
			velocity.x = move.SPEED;
		else if(move.left && !move.right)
			velocity.x = -move.SPEED
		else
			velocity.x = 0;

		if(move.up && !move.down)
			velocity.y = move.SPEED;
		else if(move.down && !move.up)
			velocity.y = -move.SPEED
		else
			velocity.y = 0;

		switch(this.firtsPersonControlType){
			case 'fly':
				pointerLockControls.getObject().position.add(velocity.applyQuaternion(editor.activeCam.getWorldQuaternion()));
				break;
			case 'mc':
				let yaw = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,-1), editor.activeCam.getWorldDirection().projectOnPlane(new THREE.Vector3(0,1,0)).normalize());
				pointerLockControls.getObject().position.add(velocity.applyQuaternion(yaw));
				break;
		}
	})

	// add key controls
	editor.keyboard.register_many([
		{
			keys: 'w',
			on_keydown: () => pointerLockControls.movement.forward = true,
			on_keyup: () => pointerLockControls.movement.forward = false
		},
		{
			keys: 's',
			on_keydown: () => pointerLockControls.movement.back = true,
			on_keyup: () => pointerLockControls.movement.back = false
		},
		{
			keys: 'a',
			on_keydown: () => pointerLockControls.movement.left = true,
			on_keyup: () => pointerLockControls.movement.left = false
		},
		{
			keys: 'd',
			on_keydown: () => pointerLockControls.movement.right = true,
			on_keyup: () => pointerLockControls.movement.right = false
		},
		{
			keys: 'r',
			on_keydown: () => pointerLockControls.movement.up = true,
			on_keyup: () => pointerLockControls.movement.up = false
		},
		{
			keys: 'q',
			on_keydown: () => pointerLockControls.movement.down = true,
			on_keyup: () => pointerLockControls.movement.down = false
		},
		{
			keys: 'space',
			on_keydown: () => pointerLockControls.movement.up = true,
			on_keyup: () => pointerLockControls.movement.up = false
		},
		{
			keys: 'f',
			on_keydown: () => pointerLockControls.movement.down = true,
			on_keyup: () => pointerLockControls.movement.down = false
		},
		{
			keys: 'e',
			on_keydown: () => pointerLockControls.movement.up = true,
			on_keyup: () => pointerLockControls.movement.up = false
		},
		{
			keys: 'shift',
			on_keydown: () => pointerLockControls.movement.SPEED = 10,
			on_keyup: () => pointerLockControls.movement.SPEED = 3
		}
	])

	// // sync the cameras
	// editor.updates.push(() => {
	// 	if(editor.activeCam == orbitCam){
	// 		let obj = pointerLockControls.getObject();
	// 		obj.position.copy(orbitCam.getWorldPosition());
	// 		obj.quaternion.setFromUnitVectors(new THREE.Vector3(), orbitCam.getWorldDirection().projectOnPlane(new THREE.Vector3(0,1,0)).normalize());
	// 	}
	// 	if(editor.activeCam == firstPersonCam){

	// 	}
	// })
}

// create the editor modes
function createModes(editor, modes) {
	modes['place-blocks'] = {
		enter(){
			editor.attachTool.enabled = true;

			editor.orbitControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.attachTool.enabled = false;

			editor.orbitControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['pick-block'] = {
		enter(){
			editor.pickBlockTool.enabled = true;

			editor.orbitControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.pickBlockTool.enabled = false;

			editor.orbitControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['place-objects'] = {
		enter(){
			editor.orbitControls.mouseButtons.ORBIT = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.orbitControls.mouseButtons.ORBIT = undefined;
		}
	}

	modes['camera-controls'] = {
		enter(){
			editor.orbitControls.mouseButtons.ORBIT = THREE.MOUSE.LEFT;
			editor.orbitControls.mouseButtons.PAN = THREE.MOUSE.RIGHT;

			editor.camLookAt.enabled = true;
			editor.camLookAt.mouseButtons.LOOK = THREE.MOUSE.MIDDLE;
		},
		exit(){
			editor.orbitControls.mouseButtons.ORBIT = undefined;
			editor.orbitControls.mouseButtons.PAN = undefined;

			editor.camLookAt.enabled = true;
			editor.camLookAt.mouseButtons.LOOK = undefined;
		}
	}

	// set up keybindings
	editor.keyboard.register_many([
		{
			keys: 'space',
			on_keydown: () => {
				if(this.cameraMode != 'first-person')
					this.mode = 'camera-controls';
			},
			on_keyup: () => {
				if(this.cameraMode != 'first-person')
					this.mode = this.prevMode;
			}
		},
		{
			keys: 'MMB',
			on_keydown: () => {
				if(this.cameraMode == 'first-person'){
					this.editor.pickBlockTool.mouseButtons.PICK = THREE.MOUSE.MIDDLE;
					this.mode = 'pick-block';
				}
			},
			on_keyup: () => {
				if(this.cameraMode == 'first-person'){
					this.mode = this.prevMode;
					this.editor.pickBlockTool.mouseButtons.PICK = THREE.MOUSE.LEFT;
				}
			}
		},
		{
			keys: '1',
			on_keydown: () => this.mode = 'place-blocks'
		},
		{
			keys: '2',
			on_keydown: () => this.mode = 'pick-block'
		},
		{
			keys: '3',
			on_keydown: () => this.mode = 'place-objects'
		},
		{
			keys: '4',
			on_keydown: () => {
				if(this.cameraMode != 'first-person')
					this.mode = 'camera-controls'
			}
		}
	]);
}

function createCameraModes(editor, cameraModes){
	cameraModes['orbit'] = {
		enter(){
			editor.activeCam = editor.orbitCam;
			editor.orbitControls.enabled = true;
			editor.attachTool.useMousePosition = true;
			editor.pickBlockTool.useMousePosition = true;
		},
		exit(){
			editor.orbitControls.enabled = false;
		}
	}

	let unwatch;
	let that = this;
	cameraModes['first-person'] = {
		enter(){
			editor.activeCam = editor.firstPersonCam;
			editor.attachTool.useMousePosition = false;
			editor.pickBlockTool.useMousePosition = false;

			unwatch = that.$watch('hasPointerLock', v => editor.pointerLockControls.enabled = v);

			// camera controls are disabled in this mode so dont let the user use them
			if(this.mode == 'camera-controls')
				this.mode = 'place-blocks';
		},
		exit(){
			editor.pointerLockControls.enabled = false;
			unwatch();
		}
	}

	// set default cam mode
	this.cameraMode = 'orbit';
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

.pointer-lock-overlay{
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0,0,0,0.5);
	cursor: pointer;
}

.first-person-pointer{
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}

</style>
