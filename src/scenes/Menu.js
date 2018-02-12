import * as THREE from "three";
import * as ChunkUtils from "../ChunkUtils";
import Scene from "./Scene";

import VoxelMap from "../voxel/VoxelMap";
import CollisionEntityVoxelMap from "../collisions/types/voxelMap";
import CollisionEntityBox from "../collisions/types/box";
import CollisionWorld from "../collisions/CollisionWorld";

import * as blocks from "../blocks/defaultBlocks";

export default class MenuScene extends Scene {
	constructor() {
		super();

		this.setupScene();
		this.createCollisions();
	}

	setupScene() {
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
		this.camera.position.z = 600;
		this.camera.position.y = 100;

		//create voxel map
		this.map = new VoxelMap();
		this.map.blockManager.registerBlock(blocks);
		this.scene.add(this.map);

		// build the map
		const blockList = Object.keys(blocks).map(key => blocks[key].UID); //.filter(UID => !UID.includes('glass'));
		ChunkUtils.drawCube(
			this.map,
			new THREE.Vector3(-10, -1, -10),
			new THREE.Vector3(10, 0, 10),
			function() {
				return blockList[Math.floor(Math.random() * blockList.length)];
			},
			"solid",
		);
		ChunkUtils.drawCube(
			this.map,
			new THREE.Vector3(-10, 0, -10),
			new THREE.Vector3(10, 1, 10),
			function() {
				return blockList[Math.floor(Math.random() * blockList.length)];
			},
			"frame",
		);
		this.map.updateChunks();

		// create box mesh
		this.boxMesh = new THREE.Mesh(
			new THREE.BoxGeometry(50, 50, 50),
			new THREE.MeshLambertMaterial({ color: 0xff0000 }),
		);
		this.scene.add(this.boxMesh);

		// add lights
		let light = new THREE.DirectionalLight(0xffffff);
		light.intensity = 0.5;
		light.position.set(1, 1, 1);
		this.scene.add(light);

		let ambient = new THREE.AmbientLight(0x666666);
		ambient.intensity = 0.5;
		this.scene.add(ambient);

		//if we are debugging add this to global scope
		if (process.env.NODE_ENV === "development") window.menuScene = this.scene;
	}
	createCollisions() {
		this.collisionWorld = new CollisionWorld();
		this.collisionMap = new CollisionEntityVoxelMap(this.map);

		this.box = new CollisionEntityBox(new THREE.Vector3(50, 50, 50));
		this.box.onCollision = (entity, normal) => {
			if (normal.y !== 0) {
				this.box.velocity.y = 0;
			}
		};

		this.collisionWorld.addEntity(this.collisionMap);
		this.collisionWorld.addEntity(this.box);
	}
	animate(dtime) {
		this.collisionWorld.step(dtime);

		this.boxMesh.position.copy(this.box.position);

		// jump box
		this.jumpTime = this.jumpTime || 0;
		this.jumpTime += dtime;
		if (this.jumpTime > 1 / 0.5) {
			if (this.box.velocity.y > -10) {
				this.box.velocity.y = +400;
			}
			this.jumpTime = 0;
		}

		if (this.box.position.y < -100) {
			this.reset();
		}
	}
	reset() {
		this.box.position.set(0, 100, 0);
		this.box.velocity.set((Math.random() * 2 - 1) * 100, 50, (Math.random() * 2 - 1) * 100);
	}
}
