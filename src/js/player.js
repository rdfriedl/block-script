import THREE from 'three';
import CollisionEntityBox from './collisions/types/box.js';

/**
 * @class
 * @name Player
 * @extends {THREE.Group}
 */
export default class Player extends THREE.Group{
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

		// add mesh for debugging
		if(process.env.NODE_ENV == 'dev'){
			let mat = new THREE.MeshBasicMaterial({
				color:'#ffffff',
				wireframe: true
			});
			let geo = new THREE.BoxGeometry(20,50,20);
			let mesh = new THREE.Mesh(geo,mat);
			this.add(mesh);
			mesh.position.y = -58/2 + 4;
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
	}

	getPosition(){
		return this.collision.position;
	}
}
