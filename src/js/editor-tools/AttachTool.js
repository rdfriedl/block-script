import THREE from 'three';
import EditorTool from './EditorTool.js';
import VoxelBlock from '../voxel/VoxelBlock.js';
import VoxelChunk from '../voxel/VoxelChunk.js';

export default class AttachTool extends EditorTool{
	constructor(camera, map, renderer){
		super();
		this.camera = camera;
		this.map = map;
		this.renderer;

		this.intersects = [this.map];
		this.raycaster = new THREE.Raycaster();
		this.mousePosition = new THREE.Vector2();
		this.target = undefined;
		this.targetNormal = undefined;
		this.targetObject = undefined;
		this.placeTarget = undefined;

		this.testCollision = undefined;
		this.checkPlace = undefined;
		this.checkRemove = undefined;

		this.placeBlockID = '';

		// bind events
		renderer.domElement.addEventListener('mousemove', event => {
			this.mousePosition.set(
				(event.clientX / renderer.domElement.clientWidth) * 2 - 1,
				- (event.clientY / renderer.domElement.clientHeight) * 2 + 1);

			this.updateTarget().updateObjects();
		});

		// place blocks
		renderer.domElement.addEventListener('mousedown', event => {
			if(this.placeTarget && event.button == THREE.MOUSE.LEFT && (!this.checkPlace || this.checkPlace(this.placeTarget))){
				this.map.setBlock(this.placeBlockID, this.placeTarget);
				this.map.updateChunks();
			}

			if(this.targetObject && event.button == THREE.MOUSE.RIGHT && (!this.checkRemove || this.checkRemove(this.targetObject))){
				this.targetObject.remove();
				this.map.updateChunks();
			}
		});

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

		// update
		this.updateObjects();
	}

	updateTarget(){
		this.raycaster.setFromCamera(this.mousePosition, this.camera);

		let intersects = this.raycaster.intersectObjects(this.intersects, true);

		if(intersects.length){
			for (var i = 0; i < intersects.length; i++) {
				let intersection = intersects[i];

				if(!this.testCollision || this.testCollision(intersects.object)){
					this.targetNormal = intersection.face.normal.clone();
					// make the normal 1/4 the size of the blocks
					let n = intersection.face.normal.clone().multiply(this.map.blockSize).divideScalar(4);
					//get target
					this.target = intersection.point.clone().sub(n).divide(this.map.blockSize).floor();
					//get place target
					this.placeTarget = intersection.point.clone().add(n).divide(this.map.blockSize).floor();

					// get target block
					if(intersection.object.parent instanceof VoxelChunk){
						this.targetObject = intersection.object.parent.getBlock(this.target.clone().sub(intersection.object.parent.worldPosition));
					}
					else
						this.targetObject = undefined;

					break;
				}
			}
		}
		else{
			this.target = undefined;
			this.targetNormal = undefined;
			this.placeTarget = undefined;
			this.targetObject = undefined;
		}

		return this;
	}

	updateObjects(){
		if(this.target){
			this.selectionFace.visible = true;
			this.selectionFace.position.copy(this.target.clone().add(new THREE.Vector3(0.5,0.5,0.5)).multiply(this.map.blockSize));
			this.selectionFace.position.add(this.map.blockSize.clone().divideScalar(2).multiply(this.targetNormal).multiplyScalar(1.1));
			this.selectionFace.quaternion.setFromUnitVectors(this.selectionFace.up, this.targetNormal);
		}
		else{
			this.selectionFace.visible = false;
		}

		return this;
	}
}
