//selection/placing tool for room editor
function SelectBlocks(state){
	this.state = state;
	this.selection = fn.duplicate(this.selection);
	this.selection.mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0.5
	}));
	this.selection.normal = new THREE.Vector3();

	this.state.scene.add(this.selection.mesh);

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	$(document).mousemove(function(event) {
		this.mouse.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			- (event.clientY / window.innerHeight) * 2 + 1
		);
	}.bind(this));
}
SelectBlocks.prototype = {
	enabled: true,
	raycaster: undefined,
	selections: [],
	selection: {
		block: undefined,
		normal: undefined,
		mesh: undefined
	},
	mouse: undefined,
	update: function(dtime){
		this.selection.mesh.visible = false;
		this.selection.block = undefined;
		this.selection.normal.set(0,0,0);

		if(!this.enabled) return;

		this.raycaster.setFromCamera(this.mouse,this.state.camera);

		var intersects = this.raycaster.intersectObject(this.state.voxelMap.group,true);
		for ( var i = 0; i < intersects.length; i++ ) {
			var pos = new THREE.Vector3().add(intersects[i].point).sub(intersects[i].face.normal);
			pos.divideScalar(game.blockSize).floor();

			var block = this.state.voxelMap.getBlock(pos);

			this.selection.block = block;

			//get normal
			var box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(game.blockSize,game.blockSize,game.blockSize));
			box.translate(block.scenePosition);
			var n = this.raycaster.ray.intersectBox(box) || block.sceneCenter, normal = new THREE.Vector3();
			n.sub(block.sceneCenter);
            if(Math.abs(n.y) > Math.abs(n.x) && Math.abs(n.y) > Math.abs(n.z))
                normal.y = Math.sign(n.y);
            else if(Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z))
                normal.x = Math.sign(n.x);
            else if(Math.abs(n.z) > Math.abs(n.x) && Math.abs(n.z) > Math.abs(n.y))
                normal.z = Math.sign(n.z);
            this.selection.normal = normal;

            //update mesh
			this.selection.mesh.visible = true;
			this.selection.mesh.position.copy(this.selection.block.sceneCenter);
			this.selection.mesh.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(game.blockSize + 1));

            delete n, box, pos; //since this is a loop delete stuff to help the garbage collector
			break;
		}
	}
}
SelectBlocks.prototype.constructor = SelectBlocks;