import {
	PointLight,
	Raycaster,
	BoxGeometry,
	MeshBasicMaterial,
	FogExp2,
	AmbientLight,
	Mesh,
	Box3,
	Vector3,
	PointerLockControls
} from "three";

// extensions
import "three/examples/js/controls/PointerLockControls";

import EnhancedScene from "./EnhancedScene";
import VoxelMap from "../voxel/VoxelMap.js";
import * as ChunkUtils from "../ChunkUtils";
import * as blocks from "../blocks/defaultBlocks.js";

import RecursiveBackTracker from "../maze-generators/RecursiveBackTracker.js";
import RoomMaze from "../rooms/RoomMaze.js";
import DefaultRooms from "../rooms.js";

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

/** the chunk load range */
const VIEW_RANGE = new Vector3(2, 2, 2);
/** all chunks father then this are unloaded and their meshes are stored in the cache */
const UNLOAD_RANGE = new Vector3(2, 2, 2);
/** all meshes in the cache that are further away then this are removed from the cache */
const UNLOAD_CACHE_RANGE = new Vector3(4, 4, 4);
/** the size of the maze */
const MAZE_SIZE = new Vector3(1, 1, 1).multiplyScalar(5);

export default class GameScene extends EnhancedScene {
	constructor() {
		super();

		this.loadTimer = 0;

		this.onPointerlockchange = this.onPointerlockchange.bind(this);

		this.setupScene();
		this.setupMaze();
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
		this.player
			.getPosition()
			.copy(this.mazeGenerator.start)
			.multiply(this.mazeRooms.roomSize)
			.add(this.mazeRooms.roomSize.clone().divideScalar(2))
			.multiply(this.map.blockSize);

		// light
		let light = new PointLight(0xffffff, 1, 300);
		this.player.add(light);

		// create controls
		this.controls = new PointerLockControls(this.player.camera);
		this.player.add(this.controls.getObject());
		this.controls.getObject().position.set(0, 0, 0);

		// listen for pointer lock change
		document.addEventListener("pointerlockchange", this.onPointerlockchange);
		document.addEventListener("mozpointerlockchange", this.onPointerlockchange);
		document.addEventListener("webkitpointerlockchange", this.onPointerlockchange);

		// pick block
		this.pickBlockRayCaster = new Raycaster();
		this.pickBlockNormal = new Vector3();
		this.pickBlockMesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshBasicMaterial({
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

		this.map.addEventListener("chunk:built", event => {
			event.chunk.mesh.castShadow = true;
			event.chunk.mesh.receiveShadow = true;
		});

		this.geometryCache = {};
		this.materialCache = {};

		// add map to collision world
		this.map.collision = new CollisionEntityVoxelMap(this.map);
		this.world.addEntity(this.map.collision);

		this.createTimer(this.loadChunks.bind(this), 1 / 60);
		this.createTimer(this.unloadCache.bind(this), 1 / 4);
		this.createTimer(this.unloadChunks.bind(this), 1 / 4);

		// debug methods
		if (process.env.NODE_ENV === "development") {
			window.logChunkCache = () => {
				console.log(this.geometryCache, this.materialCache);
			};

			window.totalBlocksInMap = () => {
				let total = {};
				this.map.chunks.forEach(chunk => {
					chunk.blocks.forEach(block => {
						if (!total[block.id]) total[block.id] = 0;

						total[block.id] += 1;
					});
				});
				return total;
			};

			window.totalBlocksInCache = () => {
				let table = {};

				Object.keys(this.map.blockManager.blockPool).forEach(id => {
					table[id] = this.map.blockManager.blockPool[id].length;
				});

				if (Object.keys(table).length) {
					console.table(table);
				}
			};

			window.logBlockInfo = () => {
				console.log("blocks in map");
				console.log(window.totalBlocksInMap());
				console.log(window.totalBlocksInCache());
			};
		}
	}

	setupMaze() {
		/** the maze generator for the scene */
		this.mazeGenerator = new RecursiveBackTracker(Vector3, MAZE_SIZE);
		this.mazeGenerator.generate({
			//make it so it only goes up or down if it has to
			weights: new Vector3(1, 0, 1)
		});

		this.mazeRooms = new RoomMaze(this.mazeGenerator, DefaultRooms);
	}

	setupScene() {
		this.scene.fog = new FogExp2(0x000000, 4 * 10 / 100000);

		// create light
		this.scene.add(new AmbientLight(0xffffff, 0.03));
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

		// this.updatePickBlock();
	}

	loadChunk(pos) {
		let chunk = this.map.createChunk(pos);
		let cacheIndex = chunk.chunkPosition.toString();

		// load the blocks into the chunk
		let roomSize = this.mazeRooms.roomSize.clone().map(v => (v -= 1));
		let chunkSize = this.map.chunkSize.clone().map(v => (v -= 1));
		let chunkPosition = chunk.worldPosition; // the position of the chunk in blocks
		let chunkRoomBBox = new Box3();
		chunkRoomBBox.min
			.copy(chunkPosition)
			.divide(this.mazeRooms.roomSize)
			.floor();
		chunkRoomBBox.max
			.copy(chunkPosition)
			.add(chunkSize)
			.divide(this.mazeRooms.roomSize)
			.floor();

		// find all the rooms we overlap
		let roomPosition = new Vector3();
		for (let x = chunkRoomBBox.min.x; x <= chunkRoomBBox.max.x; x++) {
			for (let y = chunkRoomBBox.min.y; y <= chunkRoomBBox.max.y; y++) {
				for (let z = chunkRoomBBox.min.z; z <= chunkRoomBBox.max.z; z++) {
					let room = this.mazeRooms.getOrCreateRoom(roomPosition.set(x, y, z));

					if (!room) continue;

					//convert room position into blocks
					roomPosition.set(x, y, z).multiply(this.mazeRooms.roomSize);

					// get overlap
					let overlap = new Box3();
					overlap.min
						.set(-Infinity, -Infinity, -Infinity)
						.max(chunkPosition)
						.max(roomPosition);
					overlap.max
						.set(Infinity, Infinity, Infinity)
						.min(chunkPosition.clone().add(this.map.chunkSize))
						.min(roomPosition.clone().add(roomSize));

					ChunkUtils.copyBlocks(
						room.selection,
						chunk,
						overlap.min.clone().sub(roomPosition),
						overlap.max.clone().sub(roomPosition),
						{
							offset: overlap.min.clone().sub(chunkPosition),
							keepOffset: false
						}
					);
				}
			}
		}

		// see if we need to build the chunk
		if (!this.geometryCache[cacheIndex] || !this.materialCache[cacheIndex]) {
			// build the chunk
			chunk.build();
			// cache the geometry and material
			this.geometryCache[cacheIndex] = chunk.mesh.geometry;
			this.materialCache[cacheIndex] = chunk.mesh.material;
		} else {
			// remove the mesh if the chunk has one
			if (chunk.mesh && chunk.mesh.parent) {
				chunk.mesh.parent.remove(chunk.mesh);
			}

			// create a new mesh out of the cached geometry and material
			chunk.mesh = new Mesh(this.geometryCache[cacheIndex], this.materialCache[cacheIndex]);
			chunk.mesh.scale.copy(chunk.blockSize);
			chunk.add(chunk.mesh);
		}

		return chunk;
	}
	unloadCache() {
		let tmpVec = new Vector3();
		for (let pos in this.geometryCache) {
			let vec = tmpVec.fromString(pos);
			if (!this.vectorInRange(vec, UNLOAD_CACHE_RANGE)) {
				// its outside the cache range, unload it
				delete this.geometryCache[pos];
				delete this.materialCache[pos];
			}
		}
	}
	loadChunks() {
		let playerChunkPosition = this.player
			.getPosition()
			.clone()
			.divide(this.map.blockSize)
			.divide(this.map.chunkSize)
			.floor();
		let min = playerChunkPosition.clone().sub(VIEW_RANGE);
		let max = playerChunkPosition.clone().add(VIEW_RANGE);

		let pos = new Vector3();
		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				for (let z = min.z; z <= max.z; z++) {
					pos.set(x, y, z);

					if (!this.map.hasChunk(pos)) {
						this.loadChunk(pos);
						return;
					}
				}
			}
		}
	}
	unloadChunks() {
		this.map.listChunks().forEach(chunk => {
			if (!this.vectorInRange(chunk.chunkPosition, UNLOAD_RANGE)) {
				// chunk is outside the unload range, unload it

				// dispose of the blocks
				chunk.clearBlocks();

				// remove the chunk from the voxelMap
				this.map.removeChunk(chunk);
			}
		});
	}

	updatePickBlock() {
		let pickBlock;
		this.pickBlockNormal.set(0, 0, 0);

		// cast ray to find block data
		this.pickBlockRayCaster.set(
			this.player.camera.getWorldPosition(new Vector3()),
			this.player.camera.getWorldDirection(new Vector3())
		);

		// intersect with map
		let tmpVec = new Vector3();
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
					let box = new Box3(new Vector3(), this.map.blockSize);
					box.translate(block.scenePosition);

					let n = this.pickBlockRayCaster.ray.intersectBox(box) || block.sceneCenter;
					let normal = new Vector3();

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

	vectorInRange(vec, range) {
		let playerChunkPos = this.player
			.getPosition()
			.clone()
			.divide(this.map.blockSize)
			.divide(this.map.chunkSize)
			.floor();
		return !(
			vec.x > playerChunkPos.x + range.x ||
			vec.x < playerChunkPos.x - range.x ||
			vec.y > playerChunkPos.y + range.y ||
			vec.y < playerChunkPos.y - range.y ||
			vec.z > playerChunkPos.z + range.z ||
			vec.z < playerChunkPos.z - range.z
		);
	}
}
