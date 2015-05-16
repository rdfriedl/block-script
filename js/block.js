function Block(position,data,chunk){
	this.position = position || new THREE.Vector3();
	this.chunk = chunk;

	data.material = data.material || materials.getMaterial('stone');
	data.shape = data.shape || shapes.blankShape;
	this.inportData(data);

	this.materialData = this.material.resource.data.blockData;
	// this.shapeData = this.shape.blockData;
}
Block.prototype = {
	chunk: undefined,

	shape: undefined,
	material: undefined,

	position: new THREE.Vector3(),
	rotation: new THREE.Euler(0,0,0),

	data: {},

	inportData: function(data){
		if(data.material){
			this.material = materials.getMaterial(data.material);
		}
		if(data.shape){
			this.shape = shapes.getShape(data.shape);
		}
		if(data.rotation && this.shape.canRotate){
			this.rotation = new THREE.Euler(data.rotation.x,data.rotation.y,data.rotation.z);
		}
	},
	exportData: function(){
		return {
			material: this.material.id,
			shape: this.shape.id,
			rotation: {
				x: this.rotation.x,
				y: this.rotation.y,
				z: this.rotation.z
			}
		};
	},
	dispose: function(){

	},
	getNeighbor: function(v){
        if(_.isArray(v)) v = new THREE.Vector3().fromArray(v);
		v.sign();
		var pos = v.clone().add(this.position);

       	var chunk = this.chunk;
        if(pos.x < 0 || pos.y < 0 || pos.z < 0 || pos.x >= game.chunkSize || pos.y >= game.chunkSize || pos.z >= game.chunkSize){
        	chunk = chunk.getNeighbor(v.clone());
        	if(!chunk) return; //dont go any futher if we can find the chunk
        }

        if(this.edge){
	        if(pos.x < 0) pos.x=9;
	        if(pos.y < 0) pos.y=9;
	        if(pos.z < 0) pos.z=9;
	        if(pos.x >= game.chunkSize) pos.x=0;
			if(pos.y >= game.chunkSize) pos.y=0;
			if(pos.z >= game.chunkSize) pos.z=0;
        }

        return chunk.getBlock(pos);
	}
}
var blockCol = new CollisionEntity({
	box: new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(game.blockSize,game.blockSize,game.blockSize)),
	group: 'block'
})
Object.defineProperties(Block.prototype,{
	collisionEntity: {
		get: function(){
			var col = blockCol;
			col.position.copy(this.scenePosition);
			return col;
		}
	},
	worldPosition: {
		get: function(){
			return (this.chunk)? this.chunk.position.clone().multiplyScalar(game.chunkSize).add(this.position) : new THREE.Vector3();
		}
	},
	scenePosition: {
		get: function(){
			return this.worldPosition.multiplyScalar(game.blockSize);
		}
	},
	sceneCenter: {
		get: function(){
			return this.scenePosition.add(this.center);
		}
	},
	center: {
		get: function(){
			return new THREE.Vector3(0.5,0.5,0.5).multiplyScalar(game.blockSize);
		}
	},
	edge: {
		get: function(){
			if(!(this.position.x > 0 && this.position.y > 0 && this.position.z > 0 && this.position.x < game.chunkSize-1 && this.position.y < game.chunkSize-1 && this.position.z < game.chunkSize-1)){
				return new THREE.Vector3(
					this.position.x == 0? -1 : (this.position.x == game.chunkSize-1)? 1 : 0, 
					this.position.y == 0? -1 : (this.position.y == game.chunkSize-1)? 1 : 0, 
					this.position.z == 0? -1 : (this.position.z == game.chunkSize-1)? 1 : 0
					);
			}
			return new THREE.Vector3();
		}
	},
	visible: {
		get: function(){
			// if(this._visible !== undefined) return this._visible;
			var visible = false;
			var b, sides = [
				[1,0,0],
				[0,1,0],
				[0,0,1],
				[-1,0,0],
				[0,-1,0],
				[0,0,-1]
			];

			for (var i = 0; i < sides.length; i++) {
				b = this.getNeighbor(sides[i]);
				if(b instanceof Block){
					if(b.data.transparent || b.shape.transparent){
						visible = true
						continue;
					}
					continue;
				}
				visible = true;
			};

			// this._visible = visible;
			return visible;
		}
	}
})
Block.prototype.constructor = Block;