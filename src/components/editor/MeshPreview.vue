<template>
<canvas ref="canvas" @mouseover="hoverIn" @mouseleave="hoverOut"></canvas>
</template>

<script>

import THREE from 'three';

export default {
	data(){return{
		rotate: false,
		interval: NaN
	}},
	props: {
		mesh:{
			required: true
		},
		imageSize: {
			type: Number,
			default: 64
		},
		rotateOnHover: {
			type: Boolean,
			default: true
		},
		rotationTimesPerSecond: {
			type: Number,
			default: 10
		}
	},
	methods: {
		render(){
			let mesh = this.mesh;

			if(typeof this.mesh === 'function')
				mesh = this.mesh();

			if(mesh instanceof THREE.Mesh)
				return renderMesh(this.ctx, mesh, {
					imageSize: this.imageSize,
					rotation: this.rotation
				});
			else
				return '';
		},
		hoverIn(){
			this.rotate = this.rotateOnHover;
		},
		hoverOut(){
			this.rotate = false;
		}
	},
	mounted(){
		this.rotation = new THREE.Euler();

		this.ctx = this.$refs.canvas.getContext('2d');
		this.render();
		this.$watch('mesh', () => this.render());

		const FPS = 1/30;
		let clock = new THREE.Clock();
		let update = () => {
			let dtime = clock.getDelta();
			this.rotation.y -= (Math.PI*2)/this.rotationTimesPerSecond * dtime;
			this.render();
		};
		this.$watch('rotate', v => {
			if(v){
				if(isNaN(this.interval)){
					clock.getDelta();
					this.interval = setInterval(update, FPS);
				}
			}
			else{
				clearInterval(this.interval);
				this.interval = NaN;
			}
		});

		// if we receive an event to render
		this.$on('mesh-preview-render', () => {
			this.render();
		})
	},
	destroyed(){
		clearInterval(this.interval);
	}
}

let renderer, scene, light, meshGroup, camera, helper, target;

function createScene() {
	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		alpha: true
	});
	renderer.setClearColor(0x000000, 0);

	// create scene
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(1,1,0);
	scene.add(light);
	meshGroup = new THREE.Group();
	scene.add(meshGroup);

	// create camera
	camera = new THREE.OrthographicCamera(100/-2, 100/2, 100/2, 100/-2, 0.01, 10000);

	helper = new THREE.CameraHelper(camera);
	// scene.add(helper);

	// create render target
	target = new THREE.WebGLRenderTarget(100, 100, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBaFormat});
}

function renderMesh(ctx, mesh, opts = {}){
	if(!renderer){
		createScene();
	}

	// clear scene and add mesh
	meshGroup.children.forEach(child => meshGroup.remove(child));
	meshGroup.add(mesh);

	meshGroup.rotation.set(0, 0, 0);
	if(opts.rotation){
		if(opts.rotation instanceof THREE.Euler){
			meshGroup.rotation.copy(opts.rotation);
		}
		else if(opts.rotation instanceof THREE.Quaternion){
			meshGroup.quaternion.copy(opts.rotation);
		}
		else if(Number.isFinite(opts.rotation)){
			meshGroup.rotation.set(0, opts.rotation, 0);
		}
	}

	mesh.geometry.computeBoundingSphere();
	let size = Math.round(mesh.geometry.boundingSphere.radius * 2 * Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z));

	// set size
	camera.left = camera.bottom = size/-2;
	camera.right = camera.top = size/2;
	camera.updateProjectionMatrix();

	camera.up = new THREE.Vector3(0,1,0);
	camera.position.set(size,size,size).multiplyScalar(2);

	// look at the center of the mesh
	mesh.geometry.computeBoundingBox();
	let v = mesh.geometry.boundingBox.min.clone().add(mesh.geometry.boundingBox.max.clone().sub(mesh.geometry.boundingBox.min).divideScalar(2));
	camera.lookAt(v.multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position));

	helper.update();

	let imageSize = opts.imageSize || size;

	renderer.setSize(imageSize,imageSize);
	target.width = target.height = imageSize;
	ctx.canvas.width = ctx.canvas.height = imageSize;

	// // render
	// renderer.render(scene, camera, target, true);

	// // get image data
	// let imageData = ctx.createImageData(size,size);
	// let pixels = new Uint8Array(imageData.data.length);
	// renderer.readRenderTargetPixels(target, 0, 0, size, size, pixels);
	// imageData.data.set(pixels);
	// ctx.putImageData(imageData,0,0);

	renderer.render(scene, camera);
	ctx.drawImage(renderer.domElement, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

</script>

<style>

</style>
