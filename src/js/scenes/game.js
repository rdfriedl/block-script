import THREE from 'three';
// extentions
import 'imports?THREE=three!../../lib/threejs/controls/PointerLockControls.js';

import VoxelMap from '../voxel/VoxelMap.js';
import VoxelBlockManager from '../voxel/VoxelBlockManager.js';
import * as blocks from '../blocks.js';
import * as ChunkUtils from '../ChunkUtils.js';

import ChunkGeneratorFlat from '../generators/ChunkGeneratorFlat.js';
import ChunkGeneratorRooms from '../generators/ChunkGeneratorRooms.js';

import Keyboard from '../Keyboard.js';
import Player from '../objects/Player.js';

import CollisionWorld from '../collisions/CollisionWorld.js';
import CollisionEntityVoxelMap from '../collisions/types/voxelMap.js';

import skyVertexShader from '../../shaders/vertexShader.shader';
import skyFragmentShader from '../../shaders/fragmentShader.shader';

/**
 * a function for creating a game scene
 * @name gameScene
 * @function
 * @param {Object} [opts] - a object containing options
 * @param {Keyboard} opts.keyboard - the keyboard to use for this scenes player
 * @return {Object}
 * @property {Function} update - the main update function
 * @property {Keyboard} keyboard
 * @property {THREE.Scene} scene
 * @property {VoxelMap} map
 * @property {Player} player
 */
export default function gameScene(opts = {}){
	// create keyboard
	let keyboard = opts.keyboard || new Keyboard();

	// create scene
	let scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000,4 * 10 / 100000);

	// create collision world
	let world = new CollisionWorld();

	// create player
	let player = new Player();
	scene.add(player);

	// create controls
	let controls = new THREE.PointerLockControls(player.camera);
	player.add(controls.getObject());
	controls.getObject().position.set(0,0,0);
	player.controls = controls;

	// listen for pointer lock change
	$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', () => {
		controls.enabled = !!document.pointerLockElement;
	});

	// bind keybindings for player
	keyboard.register_many([
		//up
		{
			keys: 'w',
			on_keydown: () => player.movement.forward = true,
			on_keyup: () => player.movement.forward = false
		},
		{
			keys: 'up',
			on_keydown: () => player.movement.forward = true,
			on_keyup: () => player.movement.forward = false
		},
		//left
		{
			keys: 'a',
			on_keydown: () => player.movement.left = true,
			on_keyup: () => player.movement.left = false
		},
		{
			keys: 'left',
			on_keydown: () => player.movement.left = true,
			on_keyup: () => player.movement.left = false
		},
		//down
		{
			keys: 's',
			on_keydown: () => player.movement.back = true,
			on_keyup: () => player.movement.back = false
		},
		{
			keys: 'down',
			on_keydown: () => player.movement.back = true,
			on_keyup: () => player.movement.back = false
		},
		//right
		{
			keys: 'd',
			on_keydown: () => player.movement.right = true,
			on_keyup: () => player.movement.right = false
		},
		{
			keys: 'right',
			on_keydown: () => player.movement.right = true,
			on_keyup: () => player.movement.right = false
		},
		// sprint
		{
			keys: 'shift',
			on_keydown: () => player.movement.sprint = true,
			on_keyup: () => player.movement.sprint = false
		},
		// jump
		{
			keys: 'space',
			on_keydown: () => player.movement.jump = true,
			on_keyup: () => player.movement.jump = false
		},
		{
			keys: 'num_0',
			on_keydown: () => player.movement.jump = true,
			on_keyup: () => player.movement.jump = false
		},
		// crouch
		// {
		// 	keys: 'ctrl',
		// 	on_keydown: () => player.movement.crouch = true,
		// 	on_keyup: () => player.movement.crouch = false
		// }
	]);

	// create map
	let map = new VoxelMap();
	map.blockManager.registerBlock(blocks);
	map.blockManager.usePool = true;
	map.updateChunks();
	scene.add(map);

	// add map to collision world
	map.collision = new CollisionEntityVoxelMap(map);
	world.addEntity(map.collision);

	// add player to the collision world
	world.addEntity(player.collision);
	player.getPosition().copy(map.blockSize.clone().multiply(map.chunkSize).divideScalar(2));

	// create genorator
	let generator = new ChunkGeneratorRooms();

 	// light
 	let light = new THREE.PointLight(0xffffff, 1, 300);
 	player.add(light);

	// runtime functions
	const view_range = 2;
	let loadTimer = 0;
	function loadNextChunk(){
		let vec = new THREE.Vector3(),
			dist = 0;

		let p = player.position.clone().divide(map.blockSize).divide(map.chunkSize).floor();

		while(dist < view_range){
			let v = p.clone().add(vec);

			if(!map.hasChunk(v)){
				//create it
				let chunk = map.createChunk(v);
				generator.setUpChunk(chunk);
				map.updateChunks();
				break;
			}
			else{
				if(++vec.x > dist){
					vec.x = -dist;
					vec.y++;
				}
				if(vec.y > dist){
					vec.y = -dist;
					vec.z++;
				}
				if(vec.z > dist){
					dist++;
					vec.x = -dist;
					vec.y = -dist;
					vec.z = -dist;
				}
			}
		}
	}
	function unloadChunks(){
		let chunks = map.listChunks();
		chunks.forEach(chunk => {
			let dist = chunk.chunkPosition.clone().sub(player.position.clone().divide(map.chunkSize).divide(map.blockSize).floor()).abs().toArray();
			for (var i = 0; i < dist.length; i++) {
				if(dist[i] > view_range){
					// unload chunk
					map.removeChunk(chunk);

					// dispose of all the blocks
					let blocks = chunk.listBlocks();
					chunk.clearBlocks();
					blocks.forEach(block => {
						map.blockManager.disposeBlock(block);
					});
					break;
				}
			}
		})
	}

	// pick block
	let pickBlock, pickBlockNormal = new THREE.Vector3(), rayCaster = new THREE.Raycaster();
	let pickBlockMesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true
	}));
	pickBlockMesh.scale.copy(map.blockSize);
	scene.add(pickBlockMesh);
	rayCaster.far = 32 * 10;

	function updatePickBlock() {
		pickBlock = undefined;
		pickBlockNormal.set(0,0,0);

		//cast ray to find block data
		rayCaster.set(player.camera.getWorldPosition(), player.camera.getWorldDirection());

		// intersect with map
		let tmpVec = new THREE.Vector3();
		let intersects = rayCaster.intersectObject(map, true);
		for (let i = 0; i < intersects.length; i++) {
			let pos = tmpVec.copy(intersects[i].point).sub(intersects[i].face.normal);
			let block = map.getBlock(pos.divide(map.blockSize).floor());
			if(block){
				pickBlock = block;

				//get normal
				let n = intersects[i].face.normal.clone().floor();
				if(n.x + n.y + n.z == 1){
					pickBlockNormal.copy(n);
				}
				else{
					//fall back to using a box
					let box = new THREE.Box3(new THREE.Vector3(), map.blockSize);
					box.translate(block.scenePosition);
					let n = rayCaster.ray.intersectBox(box) || block.sceneCenter, normal = new THREE.Vector3();
					n.sub(block.sceneCenter);
		            if(Math.abs(n.y) > Math.abs(n.x) && Math.abs(n.y) > Math.abs(n.z))
		                normal.y = Math.sign(n.y);
		            else if(Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z))
		                normal.x = Math.sign(n.x);
		            else if(Math.abs(n.z) > Math.abs(n.x) && Math.abs(n.z) > Math.abs(n.y))
		                normal.z = Math.sign(n.z);

		            pickBlockNormal.copy(normal);
				}

	            break;
			}
		}

		// update pick block mesh
		if(pickBlock){
			pickBlockMesh.position.copy(pickBlock.sceneCenter);
		}
	}

	// main update
	function update(dtime = 1/60){
		// only update the collision world if the chunk the player is standing in is loaded
		if(map.hasChunk(player.position.clone().divide(map.blockSize).divide(map.chunkSize).floor())){
			world.step(dtime);
		}

		callUpdate(scene, dtime);
		// updatePickBlock();

		//load chunks
		loadTimer += dtime;
		if(loadTimer > 1/10){
			loadNextChunk();
			unloadChunks();
			loadTimer = 0;
		}
	}

	return {
		update,
		keyboard,
		map,
		scene,
		player
	}
}

function callUpdate(object, dtime){
	object.children.forEach(obj => {
		if(obj.update)
			obj.update(dtime);

		if(obj.children)
			callUpdate(obj, dtime);
	})
}
