player = {
	controls: undefined,
	object: undefined,
	camera: undefined,
	movement: {
		walkSpeed: 2.5,
		runSpeed: 4,

		speed: 3,
		yspeed: 0,
		jump: false,
		zspeed: 0,
		xspeed: 0,

		gravity: 0.45,
		onGround: false
	},
	collision: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(-11,-48,-11), new THREE.Vector3(11,8,11)),
		group: 'player'
	}),
	init: function(){
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000);

		this.controls = new THREE.PointerLockControls(this.camera);
		this.object = this.controls.getObject();
		scene.add(this.object);
	},
	keydown: function(event){
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.movement.zspeed = 1;
				break;

			case 37: // left
			case 65: // a
				this.movement.xspeed = -1;
				break;

			case 40: // down
			case 83: // s
				this.movement.zspeed = -1;
				break;

			case 39: // right
			case 68: // d
				this.movement.xspeed = 1;
				break;

			case 32: // space
				this.movement.jump = true;
				break;

			case 18: // ctrl
				break;

			case 16: // shift
				this.movement.speed = this.movement.runSpeed;
				break;
		}
	},
	keyup: function(event){
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.movement.zspeed = 0;
				break;

			case 37: // left
			case 65: // a
				this.movement.xspeed = 0;
				break;

			case 40: // down
			case 83: // s
				this.movement.zspeed = 0;
				break;

			case 39: // right
			case 68: // d
				this.movement.xspeed = 0;
				break;

			case 32: // space
				this.movement.jump = false;
				break;

			case 18: // ctrl
				break;

			case 16: // shift
				this.movement.speed = this.movement.walkSpeed;
				break;
		}
	},
	update: function(){
		var oldPos = this.position.clone(), dir, col;

		//jump
		if(this.movement.onGround && this.movement.jump) this.movement.yspeed = 6;
		this.movement.onGround = false;

		//fall
		this.movement.yspeed -= this.movement.gravity;

		this.object.translateX(this.movement.speed * 0.6 * this.movement.xspeed);
		this.object.translateY(this.movement.yspeed);
		this.object.translateZ(this.movement.speed * -this.movement.zspeed);
		to = this.position.clone();
		this.position.copy(oldPos);
		to.sub(this.position);

		col = this.checkCollision(to);
		this.position.x += to.x * col.entryTime;
		this.position.y += to.y * col.entryTime;
		this.position.z += to.z * col.entryTime;
		this.collision.position.copy(this.position);
		
		if(col.normal.y !== 0){
			this.movement.yspeed = 0;
		}
		if(col.normal.y == 1){
			this.movement.onGround = true;
		}

		//slide
		to.x = (col.normal.x !== 0)? 0 : to.x - (to.x * col.entryTime);
		to.y = (col.normal.y !== 0)? 0 : to.y - (to.y * col.entryTime);
		to.z = (col.normal.z !== 0)? 0 : to.z - (to.z * col.entryTime);
		col = this.checkCollision(to);
		this.position.x += to.x * col.entryTime;
		this.position.y += to.y * col.entryTime;
		this.position.z += to.z * col.entryTime;
		this.collision.position.copy(this.position);

		//slide
		to.x = (col.normal.x !== 0)? 0 : to.x - (to.x * col.entryTime);
		to.y = (col.normal.y !== 0)? 0 : to.y - (to.y * col.entryTime);
		to.z = (col.normal.z !== 0)? 0 : to.z - (to.z * col.entryTime);
		col = this.checkCollision(to);
		this.position.x += to.x * col.entryTime;
		this.position.y += to.y * col.entryTime;
		this.position.z += to.z * col.entryTime;
		this.collision.position.copy(this.position);
	},
	checkCollision: function(velocity){
		var toGrid = function(vec){
			return vec.divideScalar(map.blockSize).floor();
		}

		var colInfo = {
        	entryTime: 1,
        	exitTime: Infinity,
        	normal: new THREE.Vector3(),
        	invEntry: new THREE.Vector3(),
        	invExit: new THREE.Vector3(),
        	entry: new THREE.Vector3(1,1,1),
        	exit: new THREE.Vector3(Infinity,Infinity,Infinity)
		};
		var dist = velocity.length();
		var loops = (dist > 20)? dist / 10 : 1;
		var done = false;

		//test for blocks
		for (var i = 0; i <= loops && done == false; i++) {
			var pos = this.position.clone().add(velocity.clone().divideScalar(loops).multiplyScalar(i));
			//check corners
			var box = this.collision._box.clone().translate(pos);
			var corners = [];

			var v = [];
			if(velocity.y !== 0){
				v.push(toGrid( new THREE.Vector3(box.max.x, box[velocity.y < 0? 'min' : 'max'].y, box.max.z) ));
				v.push(toGrid( new THREE.Vector3(box.max.x, box[velocity.y < 0? 'min' : 'max'].y, box.min.z) ));
				v.push(toGrid( new THREE.Vector3(box.min.x, box[velocity.y < 0? 'min' : 'max'].y, box.max.z) ));
				v.push(toGrid( new THREE.Vector3(box.min.x, box[velocity.y < 0? 'min' : 'max'].y, box.min.z) ));
			}
			if(velocity.x !== 0){
				v.push(toGrid( new THREE.Vector3(box[velocity.x < 0? 'min' : 'max'].x, box.max.y, box.max.z) ));
				v.push(toGrid( new THREE.Vector3(box[velocity.x < 0? 'min' : 'max'].x, box.max.y, box.min.z) ));
				v.push(toGrid( new THREE.Vector3(box[velocity.x < 0? 'min' : 'max'].x, box.min.y, box.max.z) ));
				v.push(toGrid( new THREE.Vector3(box[velocity.x < 0? 'min' : 'max'].x, box.min.y, box.min.z) ));
			}
			if(velocity.z !== 0){
				v.push(toGrid( new THREE.Vector3(box.max.x, box.max.y, box[velocity.z < 0? 'min' : 'max'].z) ));
				v.push(toGrid( new THREE.Vector3(box.min.x, box.max.y, box[velocity.z < 0? 'min' : 'max'].z) ));
				v.push(toGrid( new THREE.Vector3(box.max.x, box.min.y, box[velocity.z < 0? 'min' : 'max'].z) ));
				v.push(toGrid( new THREE.Vector3(box.min.x, box.min.y, box[velocity.z < 0? 'min' : 'max'].z) ));
			}
			for (var k = 0; k < v.length; k++) {
				var id = v[k].x+'|'+v[k].y+'|'+v[k].z;
				if(corners[id]){
					corners[id][0]++;
				}
				else{
					corners[id] = [0,v[k]];
				}
			};
			var c = [];
			for (var k in corners) {
				var index = 0;

				for (var j = 0; j < c.length; j++) {
					if(c[j][0] >= corners[k][0]){
						index = j;
						break;
					}
				};
				
				c.splice(j,0,corners[k]);
			};
			corners = c;

			//check for collisions
			for (var k in corners) {
				if(done == true) break;

				var block = map.getBlock(corners[k][1]);
				if(!block) continue;

				if(block instanceof CollisionBlock){
					var a = collisions.SweptAABB(this.collision,block.collision,velocity);
					colInfo = a;
					//had a collision so break out of the loop
					done = true;
					break;
				}
			};
		};
		return colInfo;
	}
}
Object.defineProperties(player,{
	position: {
		get: function(){
			return this.object.position;
		}
	}
})