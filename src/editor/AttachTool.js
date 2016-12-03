import THREE from 'three';
import VoxelBlock from '../voxel/VoxelBlock.js';
import VoxelSelection from '../voxel/VoxelSelection.js';
import VoxelBlockManager from '../voxel/VoxelBlockManager.js';
import * as ChunkUtils from '../ChunkUtils.js';

export default class AttachTool extends THREE.Group{
	constructor(camera, map, renderer, undoManager){
		super();
		this.enabled = false;
		this.camera = camera;
		this.map = map;
		this.renderer = renderer;
		this.undoManager = undoManager;

		this.intersects = [this.map];
		this.raycaster = new THREE.Raycaster();
		this.useMousePosition = true;
		this.mousePosition = new THREE.Vector2();
		this._mousedown = false;
		this._mousebutton = -1;

		this.start = undefined;
		this.end = undefined;

		this.testCollision = undefined;
		this.checkPlace = undefined;
		this.checkRemove = undefined;

		this.placeBlockID = '';
		this.placeBlockProps = {};
		this.fillType = 'solid';
		this.mouseButtons = {
			PLACE: THREE.MOUSE.LEFT,
			REMOVE: THREE.MOUSE.RIGHT
		}

		// bind events
		renderer.domElement.addEventListener('mousemove', event => {
			this.mousePosition.set(
				(event.offsetX / renderer.domElement.clientWidth) * 2 - 1,
				-(event.offsetY / renderer.domElement.clientHeight) * 2 + 1);
		});

		// place blocks
		renderer.domElement.addEventListener('mousedown', event => {
			if(this.enabled && event.button == this.mouseButtons.PLACE || event.button == this.mouseButtons.REMOVE){
				this.start = this.getTarget(this.useMousePosition ? this.mousePosition : new THREE.Vector3());
				this._mousedown = true;
				this._mousebutton = event.button;
			}
		});
		renderer.domElement.addEventListener('mouseup', event => {
			this.mousePosition.set(
				(event.offsetX / renderer.domElement.clientWidth) * 2 - 1,
				-(event.offsetY / renderer.domElement.clientHeight) * 2 + 1);

			this.update();

			// place
			if(
				this.enabled &&
				this._mousedown &&
				this.start && this.start.placeTarget &&
				this.end && this.end.placeTarget &&
				event.button == this.mouseButtons.PLACE &&
				(!this.checkPlace || (this.checkPlace(this.start.placeTarget) && this.checkPlace(this.end.placeTarget)))
			){
				let id = VoxelBlockManager.createID(this.placeBlockID, this.placeBlockProps);
				let newBlocks = new VoxelSelection();
				let oldBlocks = new VoxelSelection();
				let start = this.start.placeTarget.clone();
				let end = this.end.placeTarget.clone();

				// copy old blocks
				ChunkUtils.copyBlocks(this.map, oldBlocks, start, end);

				// build new blocks
				ChunkUtils.drawCube(newBlocks, start, end, id, this.fillType);

				// add command
				this.undoManager.add({
					redo: () => {
						// copy the new blocks onto the map
						ChunkUtils.copyBlocks(newBlocks, this.map, start, end, {
							copyEmpty: true
						})
					},
					undo: () => {
						// copy the new blocks onto the map
						ChunkUtils.copyBlocks(oldBlocks, this.map, start, end, {
							copyEmpty: true
						})
					}
				})

				// run command
				this.undoManager.getCommands()[this.undoManager.getIndex()].redo();
			}

			// remove
			if(
				this.enabled &&
				this._mousedown &&
				this.start && this.start.target &&
				this.end && this.end.target &&
				event.button == this.mouseButtons.REMOVE &&
				(!this.checkRemove || (this.checkRemove(this.start.target) && this.checkRemove(this.end.target)))
			){
				let oldBlocks = new VoxelSelection();
				let start = this.start.target.clone();
				let end = this.end.target.clone();

				// copy old blocks
				ChunkUtils.copyBlocks(this.map, oldBlocks, start, end);

				// add command
				this.undoManager.add({
					redo: () => {
						// clear the blocks
						ChunkUtils.clearCube(this.map, start, end);
					},
					undo: () => {
						// put the old blocks back
						ChunkUtils.copyBlocks(oldBlocks, this.map, start, end, {
							copyEmpty: true
						})
					}
				})

				// run command
				this.undoManager.getCommands()[this.undoManager.getIndex()].redo();
			}

			this.start = undefined;
			this._mousedown = false;
		})

		// create objects
		this.selectionFace = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), new THREE.MeshBasicMaterial({
			color: 0xff5555,
			transparent: true,
			opacity: 0.5,
			depthTest: false
		}));
		this.selectionFace.up = new THREE.Vector3(0,0,1);
		this.selectionFace.scale.copy(this.map.blockSize);
		this.add(this.selectionFace);

		this.selectionBox = new THREE.BoxHelper(new THREE.Box3(new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5)), 0xff5555);
		this.selectionBox.material.transparent = true;
		this.selectionBox.material.opacity = 0.8;
		this.selectionBox.material.depthTest = false;
		this.add(this.selectionBox);

		// update
		this.updateObjects();
	}

	getTarget(mouse){
		let info = {};
		this.raycaster.setFromCamera(mouse, this.camera);

		let intersects = this.raycaster.intersectObjects(this.intersects, true);

		if(intersects.length){
			for (var i = 0; i < intersects.length; i++) {
				let intersection = intersects[i];

				if(!this.testCollision || this.testCollision(intersects.object)){
					info.point = intersection.point.clone();
					info.normal = intersection.face.normal.clone();
					// make the normal 1/4 the size of the blocks
					let n = intersection.face.normal.clone().multiply(this.map.blockSize).divideScalar(4);
					// get target
					info.target = intersection.point.clone().sub(n).divide(this.map.blockSize).floor();
					// get place target
					info.placeTarget = intersection.point.clone().add(n).divide(this.map.blockSize).floor();

					break;
				}
			}
		}

		return info;
	}

	getSelectionBox(start, end){
		let half = new THREE.Vector3(0.5,0.5,0.5);
		let diff = end.clone().sub(start);
		return {
			start: start.clone().add(half).add(half.clone().multiply(diff.clone().sign().negate().map(v => v || -1))),
			end: end.clone().add(half).add(half.clone().multiply(diff.clone().sign().map(v => v || 1)))
		}
	}

	updateObjects(){
		if(this.enabled && this.end && this.end.target){
			this.selectionFace.visible = true;
			this.selectionFace.position.copy(this.end.target.clone().add(new THREE.Vector3(0.5,0.5,0.5)).multiply(this.map.blockSize));
			this.selectionFace.position.add(this.map.blockSize.clone().divideScalar(2).multiply(this.end.normal).multiplyScalar(1.05));
			this.selectionFace.quaternion.setFromUnitVectors(this.selectionFace.up, this.end.normal);
		}
		else
			this.selectionFace.visible = false;

		if(this.enabled && this.start && this.end){
			let type = this._mousebutton == this.mouseButtons.PLACE ? 'placeTarget' : 'target';
			this.selectionBox.visible = true;
			let box = this.getSelectionBox(this.start[type], this.end[type]);

			this.selectionBox.update(new THREE.Box3(box.start.clone().min(box.end).multiply(this.map.blockSize), box.start.clone().max(box.end).multiply(this.map.blockSize)));
		}
		else
			this.selectionBox.visible = false;

		return this;
	}

	update(){
		if(this.enabled){
			let target = this.getTarget(this.useMousePosition ? this.mousePosition : new THREE.Vector2());
			if(target.target)
				this.end = target;
			else
				this.end = undefined;
		}

		this.updateObjects();
	}
}
