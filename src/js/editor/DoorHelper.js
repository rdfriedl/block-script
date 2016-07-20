import THREE from 'three';

const DOOR_TYPES = {
	'center-center-4x4': (size, side) => {
		let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(4,4,1).translate(0,0,0.5), new THREE.MeshLambertMaterial({
			color: 0x55ff55,
			transparent: true,
			opacity: 0.3
		}))

		mesh.position.copy(size).divideScalar(2).multiply(side);
		mesh.lookAt(new THREE.Vector3());

		return mesh;
	}
}

export default class DoorHelper extends THREE.Group{
	constructor(map, roomSize){
		super();

		this.map = map;
		this.roomSize = new THREE.Vector3();
		this.doors = {
			x: ['none','none'],
			y: ['none','none'],
			z: ['none','none'],
			w: ['none','none']
		}

		if(roomSize instanceof THREE.Vector3)
			this.roomSize.copy(roomSize);
	}

	update(){
		this.children = [];

		for(let axis in this.doors){
			[1,-1].forEach((s, i) => {
				let side = new THREE.Vector4().set(0,0,0,0);
				side[axis] = s;

				let type = DOOR_TYPES[this.doors[axis][i]];
				if(type){
					let mesh = type(this.roomSize, side);
					if(mesh instanceof THREE.Object3D)
						this.add(mesh);
				}
			})
		}

		return this;
	}
}
