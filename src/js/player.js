import THREE from 'three';
import _ from 'underscore';

import Block from './block.js';
import shapes from './shapes.js';
import {CollisionEntity, collisions} from './collision.js';
import * as config from './config.js';

export default function Player(state,camera){
	this.state = state;
	this.scene = state.scene;
	this.camera = camera;
	this.rayCaster = new THREE.Raycaster();
	this.rayCaster.far = config.BLOCK_SIZE * 5;

	this.controls = new THREE.PointerLockControls(this.camera);
	this.controls.enabled = false;
	this.object = this.controls.getObject();
	this.velocity = this.velocity.clone();
	this.collisionEntity = this.collisionEntity.clone();
	this.movement = Object.create(this.movement);
	this.movement.velocity = new THREE.Vector3();
	this.selection = Object.create(this.selection);
	this.selection.normal = new THREE.Vector3();
	this.selection.place.rotation = new THREE.Euler();

	this.scene.add(this.object);

	//movement events
	this.setUpKeys();
	$(document).mousedown(function(event){
		if(!this.enabled) return;

		switch(event.originalEvent.button){
			case THREE.MOUSE.RIGHT:
				this.placeBlock();
				break;
			case THREE.MOUSE.LEFT:
				this.removeBlock();
				break;
		}
	}.bind(this));
}
Player.prototype = {
	_enabled: false,
	scene: undefined,
	camera: undefined,
	controls: undefined,
	object: undefined,
	movement: {
		walkSpeed: 2.29,
		sprintSpeed: 3.5,
		jumpSpeed: 4.8,

		up: false,
		left: false,
		down: false,
		right: false,
		jump: false,
		crouch: false,
		sprint: false,

		velocity: undefined,
		acceleration: 1,
		drag: 0.15,
		airDrag: 0.05,

		gravity: 0.3,
		onGround: false,
		viewBobbing: 0,
		viewBobbingDir: 1,
	},
	selectionObject: {},
	placeOutLine: {},
	selection: {
		block: undefined,
		normal: new THREE.Vector3(),
		place: {
			material: 'stone',
			shape: 'cube',
			rotation: new THREE.Euler(),
			blockRotation: 0
		},
		removeBlock: 'air'
	},
	velocity: new THREE.Vector3(),
	collisionEntity: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(-10,-50,-10), new THREE.Vector3(10,8,10)),
		group: 'player'
	}),
	setUpKeys: function(){
		var keyUp = function(move){
			return function(){this.movement[move]=false};
		};
		var keyDown = function(move){
			return function(){this.movement[move]=true};
		};
		this.state.keypress.register_many([
			//up
			{
				keys: 'w',
				on_keydown: keyDown('up'),
				on_keyup: keyUp('up'),
				this: this
			},
			{
				keys: 'up',
				on_keydown: keyDown('up'),
				on_keyup: keyUp('up'),
				this: this
			},
			//left
			{
				keys: 'a',
				on_keydown: keyDown('left'),
				on_keyup: keyUp('left'),
				this: this
			},
			{
				keys: 'left',
				on_keydown: keyDown('left'),
				on_keyup: keyUp('left'),
				this: this
			},
			//down
			{
				keys: 's',
				on_keydown: keyDown('down'),
				on_keyup: keyUp('down'),
				this: this
			},
			{
				keys: 'down',
				on_keydown: keyDown('down'),
				on_keyup: keyUp('down'),
				this: this
			},
			//right
			{
				keys: 'd',
				on_keydown: keyDown('right'),
				on_keyup: keyUp('right'),
				this: this
			},
			{
				keys: 'right',
				on_keydown: keyDown('right'),
				on_keyup: keyUp('right'),
				this: this
			},
			// sprint
			{
				keys: 'shift',
				on_keydown: keyDown('sprint'),
				on_keyup: keyUp('sprint'),
				this: this
			},
			// jump
			{
				keys: 'space',
				on_keydown: keyDown('jump'),
				on_keyup: keyUp('jump'),
				this: this
			},
			{
				keys: 'num_0',
				on_keydown: keyDown('jump'),
				on_keyup: keyUp('jump'),
				this: this
			},
			{
				keys: 'insert',
				on_keydown: keyDown('jump'),
				on_keyup: keyUp('jump'),
				this: this
			},
			// crouch
			{
				keys: 'ctrl',
				on_keydown: keyDown('crouch'),
				on_keyup: keyUp('crouch'),
				this: this
			},
			//rotate placment
			{
				keys: 'MWU',
				on_keydown: _.throttle(function(){
					var shape = shapes.getShape(this.selection.place.shape);
					if(shape.blockData.canRotate && shape.blockData.canRotateOnY && this.selection.block){
						this.state.sounds.play('digStone1',this.selection.block.sceneCenter);
						this.selection.place.blockRotation += THREE.Math.degToRad(90);
					}
					else{
						this.selection.place.blockRotation = 0;
					}
				},150,{trailing: false}),
				this: this
			},
			{
				keys: 'MWD',
				on_keydown: _.throttle(function(){
					var shape = shapes.getShape(this.selection.place.shape);
					if(shape.blockData.canRotate && shape.blockData.canRotateOnY && this.selection.block){
						this.state.sounds.play('digStone1',this.selection.block.sceneCenter);
						this.selection.place.blockRotation -= THREE.Math.degToRad(90);
					}
					else{
						this.selection.place.blockRotation = 0;
					}
				},150,{trailing: false}),
				this: this
			},
			//pick block
			{
				keys: 'MMB',
				prevent_default: true,
				on_keydown: function(){
					if(this.selection.block){
						this.state.sounds.play('digStone1',this.selection.block.sceneCenter);
						this.selection.place.material = this.selection.block.material.id;
						this.selection.place.shape = this.selection.block.shape.id;
						this.selection.place.rotation.copy(this.selection.block.rotation);

						game.modal.blocks.selectedMaterial(this.selection.place.material);
						game.modal.blocks.selectedShape(this.selection.place.shape);
					}
				},
				this: this
			},
		]);
	},
	update: function(dtime){
		var speed = (this.movement.sprint)? this.movement.sprintSpeed : this.movement.walkSpeed;
		var drag = this.movement.onGround? this.movement.drag : this.movement.airDrag;

		//only update the velocity if the chunk we are in is loaded
		var chunk = this.chunk;
		if(chunk && chunk.loaded){
			//y
			if(this.movement.onGround && this.movement.jump && this.enabled)
				this.movement.velocity.y = this.movement.jumpSpeed;
			else
				this.movement.velocity.y -= this.movement.gravity * dtime;

			//z
			if(this.movement.up && this.enabled)
				this.movement.velocity.z -= this.movement.acceleration * dtime;
			else if(this.movement.down && this.enabled)
				this.movement.velocity.z += this.movement.acceleration * dtime;
			else if(this.movement.z !== 0)
				if(Math.sign(this.movement.velocity.z + -Math.sign(this.movement.velocity.z)*drag*dtime) !== Math.sign(this.movement.velocity.z)){
					this.movement.velocity.z = 0;
				}
				else this.movement.velocity.z += -Math.sign(this.movement.velocity.z)*drag*dtime;

			//x
			if(this.movement.left && this.enabled)
				this.movement.velocity.x -= this.movement.acceleration * dtime;
			else if(this.movement.right && this.enabled)
				this.movement.velocity.x += this.movement.acceleration * dtime;
			else if(this.movement.x !== 0)
				if(Math.sign(this.movement.velocity.x + -Math.sign(this.movement.velocity.x)*drag*dtime) !== Math.sign(this.movement.velocity.x)){
					this.movement.velocity.x = 0;
				}
				else this.movement.velocity.x += -Math.sign(this.movement.velocity.x)*drag*dtime;

			//stop player from going faster then the speed
			if(this.movement.velocity.z < 0){
				if(Math.abs(this.movement.velocity.z) > speed)
					this.movement.velocity.z = speed * Math.sign(this.movement.velocity.z);
			}
			else{
				if(Math.abs(this.movement.velocity.z) > speed * 0.6)
					this.movement.velocity.z = speed * 0.6 * Math.sign(this.movement.velocity.z);
			}

			if(Math.abs(this.movement.velocity.x) > speed * 0.6)
				this.movement.velocity.x = speed * 0.6 * Math.sign(this.movement.velocity.x);

			//move
			var oldPos = this.position.clone();

			this.object.translateY(this.movement.velocity.y * dtime);
			this.object.translateX(this.movement.velocity.x * dtime);
			this.object.translateZ(this.movement.velocity.z * dtime);

			this.velocity = this.position.clone();
			this.position.copy(oldPos);
			this.velocity.sub(this.position);
		}

		//view Bobbing
		if(this.movement.onGround){ //this is going to need to be moved below the collisions so when we push against a wall we dont walk
			this.movement.viewBobbing += (Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.z*this.velocity.z) / 28) * this.movement.viewBobbingDir;

			if(Math.abs(this.movement.viewBobbing) > 1){
				this.movement.viewBobbing = Math.sign(this.movement.viewBobbing);
				this.movement.viewBobbingDir = -this.movement.viewBobbingDir;

				//play step sound
				var v = new THREE.Vector3(this.position.x,this.collisionEntity.y1,this.position.z).divideScalar(config.BLOCK_SIZE).floor();
				v.y--;
				var block = this.state.voxelMap.getBlock(v);
				if(block){
					if(block.stepSound.length){
						this.state.sounds.play(block.stepSound[Math.floor(Math.random() * block.stepSound.length)],block.sceneCenter);
					}
				}
			}

			this.camera.position.x = 1.8 * this.movement.viewBobbing;
			this.camera.position.y = - 2 * Math.abs(this.movement.viewBobbing);
		}

		this.movement.onGround = false;

		//collide
		var col, a = 0;
		while(!this.velocity.empty() && a++ < 12){
			col = collisions.collideWithBlocks(this,this.state.voxelMap);
			var rtime = 1 - col.time;
			//jump to time of collision
			this.position.add(this.velocity.clone().multiplyScalar(col.time));
			this.collisionEntity.position.copy(this.position);
			//ajust velocity to slide
			this.velocity.projectOnPlane(col.normal).multiplyScalar(rtime);

			if(col.normal.y !== 0){
				this.movement.velocity.y = 0;
			}
			if(col.normal.y == 1){
				this.movement.onGround = true;
			}
		}

		// delete col, oldPos; // jshint ignore:line

		// pick block
		this.pickBlock();
	},
	pickBlock: function(){
		this.selection.block = undefined;
		this.selection.normal.set(0,0,0);

		//cast ray to find block data
		this.rayCaster.set(this.camera.getWorldPosition(), this.controls.getDirection(new THREE.Vector3()));

		var intersects = this.rayCaster.intersectObject(this.state.voxelMap.group,true);
		for (var i = 0; i < intersects.length; i++) {
			var pos = new THREE.Vector3().add(intersects[i].point).sub(intersects[i].face.normal);
			pos.divideScalar(config.BLOCK_SIZE).floor();

			var block = this.state.voxelMap.getBlock(pos);

			if(block instanceof Block){
				this.selection.block = block;

				//get normal
				var n = intersects[i].face.normal.clone().floor();
				if(n.x + n.y + n.z == 1){
		            this.selection.normal = intersects[i].face.normal.clone();
				}
				else{
					//fall back to using a box
					var box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(config.BLOCK_SIZE,config.BLOCK_SIZE,config.BLOCK_SIZE));
					box.translate(block.scenePosition);
					var n = this.rayCaster.ray.intersectBox(box) || block.sceneCenter, normal = new THREE.Vector3(); // jshint ignore:line
					n.sub(block.sceneCenter);
		            if(Math.abs(n.y) > Math.abs(n.x) && Math.abs(n.y) > Math.abs(n.z))
		                normal.y = Math.sign(n.y);
		            else if(Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z))
		                normal.x = Math.sign(n.x);
		            else if(Math.abs(n.z) > Math.abs(n.x) && Math.abs(n.z) > Math.abs(n.y))
		                normal.z = Math.sign(n.z);
		            this.selection.normal = normal;

	            	// delete n, box; // jshint ignore:line
				}

	            break;
			}
			// delete pos; // jshint ignore:line
		}


		//update shape
		if(this.selection.block){
			if(this.selection.place.shape !== this.placeOutLine._shape){
				var geo = shapes.getShape(this.selection.place.shape).wireFrame; // jshint ignore:line
				//remove
				if(this.placeOutLine.parent) this.placeOutLine.parent.remove(this.placeOutLine);
				this.placeOutLine = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
					color: 0xffff55,
					transparent: true,
					opacity: 0.4
				}));
				this.placeOutLine.scale.multiplyScalar(config.BLOCK_SIZE);
				this.scene.add(this.placeOutLine);
				this.placeOutLine._shape = this.selection.place.shape;
			}

			this.placeOutLine.visible = !this.selection.block.getNeighbor(this.selection.normal);
			this.placeOutLine.position.copy(this.selection.block.worldPosition).add(this.selection.normal).add(new THREE.Vector3(0.5,0.5,0.5)).multiplyScalar(config.BLOCK_SIZE);
			this.placeOutLine.lookAt(this.placeOutLine.position.clone().add(this.selection.normal));
			this.placeOutLine.rotateX(THREE.Math.degToRad(90));
			this.placeOutLine.rotateY(this.selection.place.blockRotation);
			this.selection.place.rotation.copy(this.placeOutLine.rotation);
		}
		else{
			this.placeOutLine.visible = false;
		}

		//update selection
		if(this.selection.block){
			//update geo
			if(this.selection.block.shape !== this.selectionObject._shape){
				var geo = this.selection.block.shape.wireFrame; // jshint ignore:line
				//remove
				if(this.selectionObject.parent) this.selectionObject.parent.remove(this.selectionObject);
				this.selectionObject = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
					color: 0xffff55,
					transparent: true,
					opacity: 0.4
				}));
				this.selectionObject.scale.multiplyScalar(config.BLOCK_SIZE);
				this.scene.add(this.selectionObject);
				this.selectionObject._shape = this.selection.place.shape;
			}

			this.selectionObject.visible = true;
			this.selectionObject.position.copy(this.selection.block.worldPosition).add(new THREE.Vector3(0.5,0.5,0.5)).multiplyScalar(config.BLOCK_SIZE);
        	this.selectionObject.rotation.copy(this.selection.block.rotation);
		}
		else{
			this.selectionObject.visible = false;
		}
	},
	placeBlock: function(){
		if(this.selection.block){
			var pos = this.selection.block.worldPosition.add(this.selection.normal);
			var material = materials.getMaterial(this.selection.place.material);
			var shape = shapes.getShape(this.selection.place.shape);

			if(!(this.state.voxelMap.getBlock(pos) instanceof Block)){
				var blockOpts = {
					material: this.selection.place.material,
					shape: this.selection.place.shape
				};
				if(shape.blockData.canRotate && material.blockData.canRotate) blockOpts.rotation = this.selection.place.rotation;

				this.state.voxelMap.setBlock(pos,blockOpts,function(block){
					if(collisions.checkCollision(this, block)){
						this.state.voxelMap.removeBlock(pos,undefined,true);
					}
					else{
						block.chunk.saved = false;
						block.chunk.build();
						//play sound
						if(block.placeSound.length){
							this.state.sounds.play(block.placeSound[Math.floor(Math.random() * block.placeSound.length)],block.sceneCenter);
						}
					}
				}.bind(this),true);
			}
		}
	},
	removeBlock: function(){
		if(this.selection.block){
			var block = this.selection.block;
			var pos = block.worldPosition;
			this.state.voxelMap.removeBlock(pos);
			block.chunk.saved = false;
			//play sound
			if(block.removeSound.length){
				this.state.sounds.play(block.removeSound[Math.floor(Math.random() * block.removeSound.length)],block.sceneCenter);
			}
		}
	}
};
Object.defineProperties(Player.prototype,{
	position: {
		get: function(){
			return this.object.position;
		}
	},
	chunk: {
		get: function(){
			var id = this.position.clone().divideScalar(config.BLOCK_SIZE).floor().divideScalar(config.CHUNK_SIZE).floor().toString();
			return this.state.voxelMap.chunks[id];
		}
	},
	enabled: {
		get: function(){
			return this._enabled;
		},
		set: function(val){
			this._enabled = val;
			this.controls.enabled = val;
		}
	}
});
import game from './states/game.js';
