import * as THREE from "three";

// extensions
import "three/examples/js/controls/PointerLockControls";

import Scene from "./Scene";
import VoxelMap from "../voxel/VoxelMap.js";
import * as blocks from "../blocks/defaultBlocks.js";

import ChunkGeneratorRooms from "../generators/ChunkGeneratorRooms.js";

import Keyboard from "../keyboard.js";
import Player from "../objects/Player.js";

import CollisionWorld from "../collisions/CollisionWorld.js";
import CollisionEntityVoxelMap from "../collisions/types/voxelMap.js";

const MOVEMENT_KEYMAP = {
	forward: ["w", "up"],
	left: ["a", "left"],
	right: ["d", "right"],
	back: ["s", "down"],
	jump: ["space", "num_0"],
	sprint: ["shift"]
};

const VIEW_RANGE = 2;

export default class GameScene extends Scene {
	constructor() {
		super();

		this.loadTimer = 0;

		this.onPointerlockchange = this.onPointerlockchange.bind(this);

		this.setupScene();
		this.setupCollisions();
		this.setupObjects();
	}

	setupObjects() {
		this.setupMap();
		this.setupPlayer();
	}

	setupPlayer() {
		// create player
		this.player = new Player();
		this.scene.add(this.player);

		this.camera = this.player.camera;

		// add player to the collision world
		this.world.addEntity(this.player.collision);
		this.player.getPosition().copy(
			this.map.blockSize
				.clone()
				.multiply(this.map.chunkSize)
				.divideScalar(2)
		);

		// light
		let light = new THREE.PointLight(0xffffff, 1, 300);
		this.player.add(light);

		// create controls
		this.controls = new THREE.PointerLockControls(this.player.camera);
		this.player.add(this.controls.getObject());
		this.controls.getObject().position.set(0, 0, 0);

		// listen for pointer lock change
		document.addEventListener("pointerlockchange", this.onPointerlockchange);
		document.addEventListener("mozpointerlockchange", this.onPointerlockchange);
		document.addEventListener("webkitpointerlockchange", this.onPointerlockchange);

		// pick block
		this.pickBlockRayCaster = new THREE.Raycaster();
		this.pickBlockNormal = new THREE.Vector3();
		this.pickBlockMesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
				wireframe: true
			})
		);

		this.pickBlockMesh.scale.copy(this.map.blockSize);
		this.scene.add(this.pickBlockMesh);
		this.pickBlockRayCaster.far = 32 * 10;

		// create keyboard
		this.keyboard = new Keyboard();

		// bind keybindings for player
		this.keyboard.register_many(
			Object.keys(MOVEMENT_KEYMAP)
				.map(movement =>
					MOVEMENT_KEYMAP[movement].map(keys => ({
						keys,
						on_keydown: () => {
							this.player.movement[movement] = true;
						},
						on_keyup: () => {
							this.player.movement[movement] = false;
						}
					}))
				)
				.reduce((a, b) => a.concat(b), [])
		);
	}

	setupMap() {
		// create map
		this.map = new VoxelMap();
		this.map.blockManager.registerBlock(blocks);
		this.map.blockManager.usePool = true;
		this.map.useNeighborCache = false;
		this.scene.add(this.map);

		// add map to collision world
		this.map.collision = new CollisionEntityVoxelMap(this.map);
		this.world.addEntity(this.map.collision);

		// create generator
		this.generator = new ChunkGeneratorRooms();
	}

	setupScene() {
		this.scene.fog = new THREE.FogExp2(0x000000, 4 * 10 / 100000);
	}

	setupCollisions() {
		// create collision world
		this.world = new CollisionWorld();
	}

	onPointerlockchange() {
		this.controls.enabled = !!document.pointerLockElement;
	}

	animate(dtime) {
		// only update the collision world if the chunk the player is standing in is loaded
		let playerChunkPosition = this.player.position
			.clone()
			.divide(this.map.blockSize)
			.divide(this.map.chunkSize)
			.floor();
		if (this.map.hasChunk(playerChunkPosition)) {
			this.world.step(dtime);
		}

		// load chunks
		this.loadTimer += dtime;
		if (this.loadTimer > 1 / 10) {
			this.loadNextChunk();
			this.unloadChunks();
			this.loadTimer = 0;
		}

		// this.updatePickBlock();
	}

	loadNextChunk() {
		let vec = new THREE.Vector3();
		let dist = 0;

		let playerChunkPosition = this.player.position
			.clone()
			.divide(this.map.blockSize)
			.divide(this.map.chunkSize)
			.floor();

		while (dist < VIEW_RANGE) {
			let v = playerChunkPosition.clone().add(vec);

			if (!this.map.hasChunk(v)) {
				// create it
				let chunk = this.map.createChunk(v);
				this.generator.setUpChunk(chunk);
				this.map.updateChunks();
				break;
			} else {
				if (++vec.x > dist) {
					vec.x = -dist;
					vec.y++;
				}
				if (vec.y > dist) {
					vec.y = -dist;
					vec.z++;
				}
				if (vec.z > dist) {
					dist++;
					vec.x = -dist;
					vec.y = -dist;
					vec.z = -dist;
				}
			}
		}
	}
	unloadChunks() {
		this.map.listChunks().forEach(chunk => {
			let playerChunkPosition = this.player.position
				.clone()
				.divide(this.map.chunkSize)
				.divide(this.map.blockSize)
				.floor();

			let dist = chunk.chunkPosition
				.clone()
				.sub(playerChunkPosition)
				.abs()
				.toArray();

			for (let i = 0; i < dist.length; i++) {
				if (dist[i] > VIEW_RANGE) {
					// unload chunk
					this.map.removeChunk(chunk);

					// dispose of the geometry
					chunk.disposeGeometry();

					// dispose of all the blocks
					let blockList = chunk.listBlocks();
					chunk.clearBlocks();
					blockList.forEach(block => {
						this.map.blockManager.disposeBlock(block);
					});

					break;
				}
			}
		});
	}

	updatePickBlock() {
		let pickBlock;
		this.pickBlockNormal.set(0, 0, 0);

		// cast ray to find block data
		this.pickBlockRayCaster.set(this.player.camera.getWorldPosition(), this.player.camera.getWorldDirection());

		// intersect with map
		let tmpVec = new THREE.Vector3();
		let intersects = this.pickBlockRayCaster.intersectObject(this.map, true);

		for (let i = 0; i < intersects.length; i++) {
			let pos = tmpVec.copy(intersects[i].point).sub(intersects[i].face.normal);
			let block = this.map.getBlock(pos.divide(this.map.blockSize).floor());
			if (block) {
				pickBlock = block;

				// get normal
				let n = intersects[i].face.normal.clone().floor();
				if (n.x + n.y + n.z === 1) {
					this.pickBlockNormal.copy(n);
				} else {
					// fall back to using a box
					let box = new THREE.Box3(new THREE.Vector3(), this.map.blockSize);
					box.translate(block.scenePosition);

					let n = this.pickBlockRayCaster.ray.intersectBox(box) || block.sceneCenter;
					let normal = new THREE.Vector3();

					n.sub(block.sceneCenter);
					if (Math.abs(n.y) > Math.abs(n.x) && Math.abs(n.y) > Math.abs(n.z)) {
						normal.y = Math.sign(n.y);
					} else if (Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z)) {
						normal.x = Math.sign(n.x);
					} else if (Math.abs(n.z) > Math.abs(n.x) && Math.abs(n.z) > Math.abs(n.y)) {
						normal.z = Math.sign(n.z);
					}

					this.pickBlockNormal.copy(normal);
				}

				break;
			}
		}

		// update pick block mesh
		if (pickBlock) {
			this.pickBlockMesh.position.copy(pickBlock.sceneCenter);
		}
	}
}
