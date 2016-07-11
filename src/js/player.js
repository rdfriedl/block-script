import THREE from 'three';
import CollisionEntityBox from './collisions/types/box.js';
import Keyboard from './Keyboard.js';

/**
 * @class
 * @name Player
 * @extends {THREE.Group}
 */
class Player extends THREE.Group{
	constructor(){
		super();

		/**
		 * the {@link CollisionEntity} the play will use
		 * @var {CollisionEntityBox}
		 */
		this.collision = new CollisionEntityBox(new THREE.Vector3(20,58,20), new THREE.Vector3(0,-58/2 + 8,0));
		this.collision.onCollision = (entity, normal) => {
			if(normal.y !== 0){
				this.collision.velocity.y = 0;
			}

			if(normal.y == 1)
				this._onGround = true;
		}

		/**
		 * @var {THREE.PerspectiveCamera}
		 */
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);
		this.add(this.camera);

		//resize camera when window resizes
		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		})

		/**
		 * @var {Object}
		 */
		this.movement = {
			forward: false,
			left: false,
			back: false,
			right: false,
			jump: false,
			crouch: false,
			sprint: false
		}

		/**
		 * @var {Boolean}
		 * @private
		 */
		this._onGround = false;

		/**
		 * a Vec2 used to store the players forward / back and left / right movements
		 * @var {THREE.Vector2}
		 * @private
		 */
		this._movementVelocity = new THREE.Vector2();
		this._viewBobbing = 0;
		this._viewBobbingDir = 1;

		// add mesh for debugging
		if(process.env.NODE_ENV == 'dev'){
			let mat = new THREE.MeshBasicMaterial({
				color:'#ffffff',
				wireframe: true
			});
			let geo = new THREE.BoxGeometry(20,58,20);
			let mesh = new THREE.Mesh(geo,mat);
			this.add(mesh);
			mesh.position.y = -58/2 + 8;
		}
	}

	// short hand to the collision`s velocity
	get velocity(){
		return this.collision.velocity;
	}
	set velocity(v){
		this.collision.velocity = v;
		return v;
	}

	update(){
		this.position.copy(this.collision.position);

		// movment
		const speed = this.movement.sprint? Player.SPRINT_SPEED : Player.WALK_SPEED;
		const drag = this._onGround? Player.DRAG : Player.AIR_DRAG;

		//jump
		if(this._onGround && this.movement.jump)
			this.velocity.y = Player.JUMP_POWER;

		// forward / back
		if(this.movement.forward){
			this._movementVelocity.y += Player.MOVEMENT_ACCELERATION;
		}
		else if(this.movement.back){
			this._movementVelocity.y -= Player.MOVEMENT_ACCELERATION;
		}
		else{ //ease back to 0
			if(Math.sign(this._movementVelocity.y + -Math.sign(this._movementVelocity.y)*drag) !== Math.sign(this._movementVelocity.y)){
				this._movementVelocity.y = 0;
			}
			else this._movementVelocity.y += -Math.sign(this._movementVelocity.y)*drag;
		}

		// left / right
		if(this.movement.left){
			this._movementVelocity.x += Player.MOVEMENT_ACCELERATION;
		}
		else if(this.movement.right){
			this._movementVelocity.x -= Player.MOVEMENT_ACCELERATION;
		}
		else{ //ease back to 0
			if(Math.sign(this._movementVelocity.x + -Math.sign(this._movementVelocity.x)*drag) !== Math.sign(this._movementVelocity.x)){
				this._movementVelocity.x = 0;
			}
			else this._movementVelocity.x += -Math.sign(this._movementVelocity.x)*drag;
		}

		//clamp players walk speed
		if(this._movementVelocity.y > 0){ // forward
			if(Math.abs(this._movementVelocity.y) > speed)
				this._movementVelocity.y = speed * Math.sign(this._movementVelocity.y);
		}
		else{ // back
			if(Math.abs(this._movementVelocity.y) > speed * Player.WALK_BACK_SPEED)
				this._movementVelocity.y = speed * Player.WALK_BACK_SPEED * Math.sign(this._movementVelocity.y);
		}

		// left / right
		if(Math.abs(this._movementVelocity.x) > speed * Player.STRAFE_SPEED)
			this._movementVelocity.x = speed * Player.STRAFE_SPEED * Math.sign(this._movementVelocity.x);

		// apply movement to velocity
		let v = this.camera.getWorldDirection();
		let angle = Math.atan2(v.x, v.z);
		let velocity = new THREE.Vector3(this._movementVelocity.x, 0, this._movementVelocity.y).applyAxisAngle(this.up, angle);
		this.velocity.x = velocity.x;
		this.velocity.z = velocity.z;

		// //view Bobbing
		// if(this._onGround){ //this is going to need to be moved below the collisions so when we push against a wall we dont walk
		// 	this._viewBobbing += (Math.sqrt(this._movementVelocity.x*this._movementVelocity.x + this._movementVelocity.y*this._movementVelocity.y) / (28*60)) * this._viewBobbingDir;

		// 	if(Math.abs(this._viewBobbing) > 1){
		// 		this._viewBobbing = Math.sign(this._viewBobbing);
		// 		this._viewBobbingDir = -this._viewBobbingDir;
		// 	}

		// 	this.camera.position.x = 1.8 * this._viewBobbing;
		// 	this.camera.position.y = - 2 * Math.abs(this._viewBobbing);
		// }

		// reset on ground boolean
		this._onGround = false;
	}

	getPosition(){
		return this.collision.position;
	}

	bindKeys(keyboard){

	}

	unbindKeys(keyboard){

	}
}
Player.WALK_SPEED = 2.29 * 60;
Player.WALK_BACK_SPEED = 0.5; // % of player speed
Player.STRAFE_SPEED = 0.6; // % of player speed
Player.SPRINT_SPEED = 3.5 * 60;
Player.JUMP_POWER = 4.8 * 60;
Player.DRAG = 0.15 * 60;
Player.AIR_DRAG = 0.05 * 60;
Player.MOVEMENT_ACCELERATION = 1 * 60;

export {Player as default}
