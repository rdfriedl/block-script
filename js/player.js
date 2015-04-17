function Player(state,scene,camera){
	this.state = state;
	this.scene = scene;
	this.camera = camera;
	this.rayCaster = new THREE.Raycaster();
	this.rayCaster.far = settings.blockSize * 5;

	this.controls = new THREE.PointerLockControls(this.camera);
	this.controls.enabled = false;
	this.object = this.controls.getObject();
	this.velocity = this.velocity.clone();;
	this.collision = this.collision.clone();
	this.movement = Object.create(this.movement);
	this.selection = Object.create(this.selection);
	this.selection.position = new THREE.Vector3();
	this.selection.normal = new THREE.Vector3();

	this.scene.add(this.object);

	//selection
	this.selectionObject = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
		color: 0x990000,
		transparent: true,
		opacity: 0.2,
		shading: THREE.NoShading
	}));
	// this.selectionObject.visible = false;
	this.scene.add(this.selectionObject);

	//movement events
	$(document).keydown(this.keydown.bind(this)).keyup(this.keyup.bind(this));
	$(document).mousedown(function(event){
		if(!this.enabled) return;

		switch(event.originalEvent.button){
			case THREE.MOUSE.LEFT:
				this.placeBlock()
				break;
			case THREE.MOUSE.RIGHT:
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
		walkSpeed: 2.5,
		sprintSpeed: 4,

		up: false,
		left: false,
		down: false,
		right: false,
		jump: false,
		crouch: false,
		sprint: false,

		gravity: 0.45,
		fallSpeed: 0,
		onGround: false
	},
	selection: {
		block: undefined,
		position: new THREE.Vector3(),
		normal: new THREE.Vector3()
	},
	velocity: new THREE.Vector3(),
	collision: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(-11,-48,-11), new THREE.Vector3(11,8,11)),
		group: 'player'
	}),
	keydown: function(event){
		if(!this.enabled) return;
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.movement.up = true;
				break;

			case 37: // left
			case 65: // a
				this.movement.left = true;
				break;

			case 40: // down
			case 83: // s
				this.movement.down = true;
				break;

			case 39: // right
			case 68: // d
				this.movement.right = true;
				break;

			case 32: // space
				this.movement.jump = true;
				break;

			case 18: // ctrl
				this.movement.crouch = true;
				break;

			case 16: // shift
				this.movement.sprint = true;
				break;
		}
	},
	keyup: function(event){
		if(!this.enabled) return;
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.movement.up = false;
				break;

			case 37: // left
			case 65: // a
				this.movement.left = false;
				break;

			case 40: // down
			case 83: // s
				this.movement.down = false;
				break;

			case 39: // right
			case 68: // d
				this.movement.right = false;
				break;

			case 32: // space
				this.movement.jump = false;
				break;

			case 18: // ctrl
				this.movement.crouch = false;
				break;

			case 16: // shift
				this.movement.sprint = false;
				break;
		}
	},
	update: function(){
		if(!this.enabled) return;
		var oldPos = this.position.clone(), col;

		//fall
		this.movement.fallSpeed -= this.movement.gravity;

		//move
		speed = (this.movement.sprint)? this.movement.sprintSpeed : this.movement.walkSpeed;

		if(this.movement.onGround && this.movement.jump) this.movement.fallSpeed = 6;
		this.object.translateY(this.movement.fallSpeed);
		this.movement.onGround = false;

		if(this.movement.up) this.object.translateZ(-speed);
		if(this.movement.down) this.object.translateZ(speed);
		if(this.movement.right) this.object.translateX(speed * 0.6);
		if(this.movement.left) this.object.translateX(-speed * 0.6);

		this.velocity = this.position.clone();
		this.position.copy(oldPos);
		this.velocity.sub(this.position);

		col = collisions.collideWithBlocks(this,this.state.map);
		this.position.x += this.velocity.x * col.entryTime;
		this.position.y += this.velocity.y * col.entryTime;
		this.position.z += this.velocity.z * col.entryTime;
		this.collision.position.copy(this.position);

		if(col.normal.y !== 0){
			this.movement.fallSpeed = 0;
		}
		if(col.normal.y == 1){
			this.movement.onGround = true;
		}

		//slide
		this.velocity.x = (col.normal.x !== 0)? 0 : this.velocity.x - (this.velocity.x * col.entryTime);
		this.velocity.y = (col.normal.y !== 0)? 0 : this.velocity.y - (this.velocity.y * col.entryTime);
		this.velocity.z = (col.normal.z !== 0)? 0 : this.velocity.z - (this.velocity.z * col.entryTime);
		col = collisions.collideWithBlocks(this,this.state.map);
		this.position.x += this.velocity.x * col.entryTime;
		this.position.y += this.velocity.y * col.entryTime;
		this.position.z += this.velocity.z * col.entryTime;
		this.collision.position.copy(this.position);

		//slide
		this.velocity.x = (col.normal.x !== 0)? 0 : this.velocity.x - (this.velocity.x * col.entryTime);
		this.velocity.y = (col.normal.y !== 0)? 0 : this.velocity.y - (this.velocity.y * col.entryTime);
		this.velocity.z = (col.normal.z !== 0)? 0 : this.velocity.z - (this.velocity.z * col.entryTime);
		col = collisions.collideWithBlocks(this,this.state.map);
		this.position.x += this.velocity.x * col.entryTime;
		this.position.y += this.velocity.y * col.entryTime;
		this.position.z += this.velocity.z * col.entryTime;
		this.collision.position.copy(this.position);

		// pick block
		this.pickBlock();
	},
	pickBlock: function(){
		//cast ray to find block data
		this.rayCaster.set(this.position, this.controls.getDirection(new THREE.Vector3()));
		// this.rayCaster.setFromCamera(new THREE.Vector2(), this.camera);

		var pos = this.position.clone().divideScalar(settings.blockSize).floor().divideScalar(settings.chunkSize).floor();
		var chunk = this.state.map.getChunk(pos);
		if(chunk){
			// var chunks = [chunk.mesh];
			var intersects = this.rayCaster.intersectObject(this.state.map.group,true);
			for (var i = 0; i < intersects.length; i++) {
				var pos = new THREE.Vector3().add(intersects[i].point).sub(intersects[i].face.normal);
				pos.divideScalar(settings.blockSize).floor();

				var block = this.state.map.getBlock(pos);

				//see if its a solid block
				if(block instanceof SolidBlock){
					this.selection.position.copy(block.worldPosition);
					this.selection.block = block;
					this.selection.normal.copy(intersects[i].face.normal);

					this.selectionObject.visible = true;
					this.selectionObject.position.copy(this.selection.block.worldPosition).multiplyScalar(settings.blockSize);
					this.selectionObject.position.add(new THREE.Vector3(0.5,0.5,0.5).multiplyScalar(settings.blockSize));
					this.selectionObject.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(settings.blockSize + 0.1))
					return;
				}
			};

			//if we made it to this point it means there are not intersections
			this.selectionObject.visible = false;
			this.selection.block = undefined;
			this.selection.position.set(0,0,0);
			this.selection.normal.set(0,0,0);
		}
	},
	placeBlock: function(){
		if(this.selection.block){
			block = this.selection.block.getNeighbor(this.selection.normal);
			if(block){
				var newBlock = block.replace('stone');
				block.chunk.saved = false;
				//play sound
				if(newBlock.placeSound.length){
					createjs.Sound.play(newBlock.placeSound[Math.floor(Math.random() * newBlock.placeSound.length)]);
				}
			}
		}
	},
	removeBlock: function(){
		if(this.selection.block){
			var block = this.selection.block;
			block.replace('air');
			block.chunk.saved = false;
			//play sound
			if(block.breakSound.length){
				createjs.Sound.play(block.breakSound[Math.floor(Math.random() * block.breakSound.length)]);
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