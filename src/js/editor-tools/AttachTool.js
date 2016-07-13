import THREE from 'three';
import EditorTool from './EditorTool.js';
import VoxelBlock from '../voxel/VoxelBlock.js';
import VoxelChunk from '../voxel/VoxelChunk.js';
import * as ChunkUtils from '../ChunkUtils.js';

export default class AttachTool extends EditorTool{
	constructor(camera, map, renderer){
		super();
		this.camera = camera;
		this.map = map;
		this.renderer;

		this.enabled = true;

		this.intersects = [this.map];
		this.raycaster = new THREE.Raycaster();
		this.mousePosition = new THREE.Vector2();
		this.mousedown = false;
		this.mousebutton = -1;

		this.start = undefined;
		this.end = undefined;

		this.testCollision = undefined;
		this.checkPlace = undefined;
		this.checkRemove = undefined;

		this.placeBlockID = '';

		// bind events
		renderer.domElement.addEventListener('mousemove', event => {
			this.mousePosition.set(
				(event.clientX / renderer.domElement.clientWidth) * 2 - 1,
				- (event.clientY / renderer.domElement.clientHeight) * 2 + 1);

			this.end = this.getTarget(this.mousePosition);

			this.updateObjects();
		});

		// place blocks
		renderer.domElement.addEventListener('mousedown', event => {
			if(event.button == THREE.MOUSE.LEFT || event.button == THREE.MOUSE.RIGHT){
				this.start = this.getTarget(this.mousePosition);
				this.mousedown = true;
				this.mousebutton = event.button;
			}
		});
		renderer.domElement.addEventListener('mouseup', event => {
			// place
			if(
				this.mousedown &&
				this.start && this.start.placeTarget &&
				this.end && this.end.placeTarget &&
				event.button == THREE.MOUSE.LEFT &&
				(!this.checkPlace || (this.checkPlace(this.start.placeTarget) && this.checkPlace(this.end.placeTarget)))
			){
				let box = this.getSelectionBox(this.start.placeTarget, this.end.placeTarget);
				ChunkUtils.drawCube(this.map, box.start, box.end, this.placeBlockID);
				this.map.updateChunks();
			}

			// remove
			if(
				this.mousedown &&
				this.start && this.start.target &&
				this.end && this.end.target &&
				event.button == THREE.MOUSE.RIGHT &&
				(!this.checkRemove || (this.checkRemove(this.start.target) && this.checkRemove(this.end.target)))
			){
				let box = this.getSelectionBox(this.start.target, this.end.target);
				ChunkUtils.drawCube(this.map, box.start, box.end, null);
				this.map.updateChunks();
			}

			this.start = undefined;
			this.mousedown = false;
		})

		// create objects
		this.selectionFace = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), new THREE.MeshBasicMaterial({
			color: 0xff2222,
			transparent: true,
			opacity: 0.5,
			depthTest: false
		}));
		this.selectionFace.up = new THREE.Vector3(0,0,1);
		this.selectionFace.scale.copy(this.map.blockSize);
		this.add(this.selectionFace);

		this.selectionBox = new THREE.Mesh(new THREE.BoxBufferGeometry(1,1,1), new THREE.MeshBasicMaterial({
			color: 0xff2222,
			transparent: true,
			opacity: 0.5,
			depthTest: false,
			wireframe: true
		}));//, 0xff2222);
		// this.selectionBox.material.depthTest = false;
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
					//get target
					info.target = intersection.point.clone().sub(n).divide(this.map.blockSize).floor();
					//get place target
					info.placeTarget = intersection.point.clone().add(n).divide(this.map.blockSize).floor();

					// get target block
					if(intersection.object.parent instanceof VoxelChunk)
						info.block = intersection.object.parent.getBlock(info.target.clone().sub(intersection.object.parent.worldPosition));

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
		if(this.end && this.end.target){
			this.selectionFace.visible = true;
			this.selectionFace.position.copy(this.end.target.clone().add(new THREE.Vector3(0.5,0.5,0.5)).multiply(this.map.blockSize));
			this.selectionFace.position.add(this.map.blockSize.clone().divideScalar(2).multiply(this.end.normal).multiplyScalar(1.05));
			this.selectionFace.quaternion.setFromUnitVectors(this.selectionFace.up, this.end.normal);
		}
		else
			this.selectionFace.visible = false;

		if(this.start){
			let type = this.mousebutton == THREE.MOUSE.LEFT? 'placeTarget' : 'target';
			this.selectionBox.visible = true;
			let box = this.getSelectionBox(this.start[type], this.end[type]);

			this.selectionBox.position.copy(box.start).add(box.end.clone().sub(box.start).divideScalar(2)).multiply(this.map.blockSize);
			this.selectionBox.scale.copy(box.end.clone().sub(box.start)).multiply(this.map.blockSize);
		}
		else
			this.selectionBox.visible = false;

		return this;
	}
}
