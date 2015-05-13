function Player(state,camera){
	this.state = state;
	this.scene = state.scene;
	this.camera = camera;
	this.rayCaster = new THREE.Raycaster();
	this.rayCaster.far = game.blockSize * 5;

	this.controls = new THREE.PointerLockControls(this.camera);
	this.controls.enabled = false;
	this.object = this.controls.getObject();
	this.velocity = this.velocity.clone();
	this.collisionEntity = this.collisionEntity.clone();
	this.movement = Object.create(this.movement);
	this.movement.velocity = new THREE.Vector3();
	this.selection = Object.create(this.selection);
	this.selection.normal = new THREE.Vector3();

	this.scene.add(this.object);

	//selection
	this.selectionObject = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
		color: 0x990000,
		transparent: true,
		opacity: 0.2,
		shading: THREE.NoShading,
		depthWrite: false
	}));
	// this.selectionObject.visible = false;
	this.scene.add(this.selectionObject);

	//movement events
	this.setUpKeys();
	$(document).mousedown(function(event){
		if(!this.enabled) return;

		switch(event.originalEvent.button){
			case THREE.MOUSE.RIGHT:
				this.placeBlock()
				break;
			case THREE.MOUSE.LEFT:
				this.removeBlock()
				break;
		}
	}.bind(this))
}
Player.prototype = {
	_enabled: false,
	scene: undefined,
	camera: undefined,
	controls: undefined,
	object: undefined,
	selectionObject: undefined,
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
		drag: 0.2,

		gravity: 0.3,
		onGround: false,
		viewBobbing: 0,
		viewBobbingDir: 1,
	},
	selection: {
		block: undefined,
		normal: new THREE.Vector3(),
		placeBlock: 'stone',
		removeBlock: 'air'
	},
	velocity: new THREE.Vector3(),
	collisionEntity: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(-10,-50,-10), new THREE.Vector3(10,8,10)),
		group: 'player'
	}),
	setUpKeys: function(){
		this.state.keypress.register_many([
			//up
			{
				keys: 'w',
				on_keydown: function(){
					this.movement.up = true;
				},
				on_keyup: function(){
					this.movement.up = false;
				},
				this: this
			},
			{
				keys: 'up',
				on_keydown: function(){
					this.movement.up = true;
				},
				on_keyup: function(){
					this.movement.up = false;
				},
				this: this
			},
			//left
			{
				keys: 'a',
				on_keydown: function(){
					this.movement.left = true;
				},
				on_keyup: function(){
					this.movement.left = false;
				},
				this: this
			},
			{
				keys: 'left',
				on_keydown: function(){
					this.movement.left = true;
				},
				on_keyup: function(){
					this.movement.left = false;
				},
				this: this
			},
			//down
			{
				keys: 's',
				on_keydown: function(){
					this.movement.down = true;
				},
				on_keyup: function(){
					this.movement.down = false;
				},
				this: this
			},
			{
				keys: 'down',
				on_keydown: function(){
					this.movement.down = true;
				},
				on_keyup: function(){
					this.movement.down = false;
				},
				this: this
			},
			//right
			{
				keys: 'd',
				on_keydown: function(){
					this.movement.right = true;
				},
				on_keyup: function(){
					this.movement.right = false;
				},
				this: this
			},
			{
				keys: 'right',
				on_keydown: function(){
					this.movement.right = true;
				},
				on_keyup: function(){
					this.movement.right = false;
				},
				this: this
			},
			// sprint
			{
				keys: 'shift',
				on_keydown: function(){
					this.movement.sprint = true;
				},
				on_keyup: function(){
					this.movement.sprint = false;
				},
				this: this
			},
			// jump
			{
				keys: 'space',
				on_keydown: function(){
					this.movement.jump = true;
				},
				on_keyup: function(){
					this.movement.jump = false;
				},
				this: this
			},
			{
				keys: 'num_0',
				on_keydown: function(){
					this.movement.jump = true;
				},
				on_keyup: function(){
					this.movement.jump = false;
				},
				this: this
			},
			{
				keys: 'insert',
				on_keydown: function(){
					this.movement.jump = true;
				},
				on_keyup: function(){
					this.movement.jump = false;
				},
				this: this
			},
			// crouch
			{
				keys: 'ctrl',
				on_keydown: function(){
					this.movement.crouch = true;
				},
				on_keyup: function(){
					this.movement.crouch = false;
				},
				this: this
			}
		])	
	},
	update: function(dtime){
		var speed = (this.movement.sprint)? this.movement.sprintSpeed : this.movement.walkSpeed;

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
		else
			if(Math.sign(this.movement.velocity.z) !== Math.sign(this.movement.velocity.z - this.movement.drag * Math.sign(this.movement.velocity.z)) * dtime){
				this.movement.velocity.z = 0;
			}
			else this.movement.velocity.z -= this.movement.drag * Math.sign(this.movement.velocity.z) * dtime;

		//x
		if(this.movement.left && this.enabled)
			this.movement.velocity.x -= this.movement.acceleration * dtime;
		else if(this.movement.right && this.enabled)
			this.movement.velocity.x += this.movement.acceleration * dtime;
		else 
			if(Math.sign(this.movement.velocity.x) !== Math.sign(this.movement.velocity.x - this.movement.drag * Math.sign(this.movement.velocity.x)) * dtime){
				this.movement.velocity.x = 0;
			}
			else this.movement.velocity.x -= this.movement.drag * Math.sign(this.movement.velocity.x) * dtime;

		//stop player from going faster them the speed
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
		var oldPos = this.position.clone()

		this.object.translateY(this.movement.velocity.y * dtime);
		this.object.translateX(this.movement.velocity.x * dtime);
		this.object.translateZ(this.movement.velocity.z * dtime);

		this.velocity = this.position.clone();
		this.position.copy(oldPos);
		this.velocity.sub(this.position);

		//view
		if(this.movement.onGround){ //this is going to need to be moved below the collisions so when we push against a wall we dont walk
			this.movement.viewBobbing += (Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.z*this.velocity.z) / 28) * this.movement.viewBobbingDir;

			if(Math.abs(this.movement.viewBobbing) > 1){
				this.movement.viewBobbing = Math.sign(this.movement.viewBobbing);
				this.movement.viewBobbingDir = -this.movement.viewBobbingDir;

				//play step sound
				var v = new THREE.Vector3(this.position.x,this.collisionEntity.y1,this.position.z).divideScalar(game.blockSize).floor();
				v.y--;
				var block = this.state.voxelMap.getBlock(v);
				if(block){
					if(block.stepSound.length){
						createjs.Sound.play(block.stepSound[Math.floor(Math.random() * block.stepSound.length)]);
					}
				}
			}

			this.camera.position.x = 1.8 * this.movement.viewBobbing;
			this.camera.position.y = - 2 * Math.abs(this.movement.viewBobbing);
		}

		this.movement.onGround = false;

		//collide
		for(var i = 0; i < 3; i++){ //check for collision on each axis
			col = collisions.collideWithBlocks(this,this.state.voxelMap);
			this.position.x += this.velocity.x * col.entryTime;
			this.position.y += this.velocity.y * col.entryTime;
			this.position.z += this.velocity.z * col.entryTime;
			this.collisionEntity.position.copy(this.position);
			this.velocity.x = (col.normal.x !== 0)? 0 : this.velocity.x - (this.velocity.x * col.entryTime);
			this.velocity.y = (col.normal.y !== 0)? 0 : this.velocity.y - (this.velocity.y * col.entryTime);
			this.velocity.z = (col.normal.z !== 0)? 0 : this.velocity.z - (this.velocity.z * col.entryTime);

			if(col.normal.y !== 0){
				this.movement.velocity.y = 0;
			}
			if(col.normal.y == 1){
				this.movement.onGround = true;
			}
		}

		delete col, oldPos, i;

		// pick block
		this.pickBlock();
	},
	pickBlock: function(){
		//cast ray to find block data
		this.rayCaster.set(this.camera.getWorldPosition(), this.controls.getDirection(new THREE.Vector3()));

		var pos = this.position.clone().divideScalar(game.blockSize).floor().divideScalar(game.chunkSize).floor();
		var chunk = this.state.voxelMap.getChunk(pos);
		if(chunk){
			// var chunks = [chunk.mesh];
			var intersects = this.rayCaster.intersectObject(this.state.voxelMap.group,true);
			for (var i = 0; i < intersects.length; i++) {
				var pos = new THREE.Vector3().add(intersects[i].point).sub(intersects[i].face.normal);
				pos.divideScalar(game.blockSize).floor();

				var block = this.state.voxelMap.getBlock(pos);

				this.selection.block = block;
				// this.selection.normal.copy(intersects[i].face.normal);
				//get normal
				var box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(game.blockSize,game.blockSize,game.blockSize));
				box.translate(block.scenePosition);
				var n = this.rayCaster.ray.intersectBox(box) || block.sceneCenter, normal = new THREE.Vector3();
				n.sub(block.sceneCenter);
	            if(Math.abs(n.y) > Math.abs(n.x) && Math.abs(n.y) > Math.abs(n.z))
	                normal.y = Math.sign(n.y);
	            else if(Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z))
	                normal.x = Math.sign(n.x);
	            else if(Math.abs(n.z) > Math.abs(n.x) && Math.abs(n.z) > Math.abs(n.y))
	                normal.z = Math.sign(n.z);
	            this.selection.normal = normal;

	            delete n, box; //since this is a loop delete stuff to help the garbage collector

				this.selectionObject.visible = true;
				this.selectionObject.position.copy(this.selection.block.sceneCenter);
				this.selectionObject.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(game.blockSize + 0.1))
				return;
			};

			//if we made it to this point it means there are not intersections
			this.selectionObject.visible = false;
			this.selection.block = undefined;
			this.selection.normal.set(0,0,0);
		}
	},
	placeBlock: function(){
		if(this.selection.block){
			block = this.selection.block.getNeighbor(this.selection.normal);

			if(block && block instanceof blocks.getBlock('air')){
				var newBlock = block.replace(this.selection.placeBlock, true);
				
				if(collisions.checkCollision(this, newBlock)){
					newBlock.replace('air');
				}
				else{
					newBlock = block.replace(this.selection.placeBlock, false);
					block.chunk.saved = false;
					//play sound
					if(newBlock.placeSound.length){
						createjs.Sound.play(newBlock.placeSound[Math.floor(Math.random() * newBlock.placeSound.length)]);
					}
				}
			}
		}
	},
	removeBlock: function(){
		if(this.selection.block){
			var block = this.selection.block;
			block.replace(this.selection.removeBlock);
			block.chunk.saved = false;
			//play sound
			if(block.removeSound.length){
				createjs.Sound.play(block.removeSound[Math.floor(Math.random() * block.removeSound.length)]);
			}
		}
	}
}
Object.defineProperties(Player.prototype,{
	position: {
		get: function(){
			return this.object.position;
		}
	},
	chunk: {
		get: function(){
			var id = this.position.clone().divideScalar(game.blockSize).floor().divideScalar(game.chunkSize).floor().toString();
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
})