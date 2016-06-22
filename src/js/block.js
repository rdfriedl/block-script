import THREE from 'three';
import {CollisionEntity} from './collision.js';
import shapes from './shapes.js';
import _ from 'underscore';
import * as config from './config.js';

export default function Block(position,data,chunk){
	this.position = position || new THREE.Vector3();
	this.chunk = chunk;

	this.material = Materials.inst.getMaterial(data? data.material : undefined);
	this.shape = shapes.getShape(data? data.shape : undefined);

	this.inportData(data);
}
Block.prototype = {
	chunk: undefined,

	shape: undefined,
	material: undefined,

	position: new THREE.Vector3(),
	rotation: new THREE.Euler(0,0,0),

	data: {
		transparent: false,
		canRotate: true,
		canRotateOnY: true,
		canCollide: true,
		stepSound: [],
		placeSound: [],
		removeSound: []
	},

	inportData: function(data){
		if(!data) return;

		this.material = Materials.inst.getMaterial(data.material);
		this.shape = shapes.getShape(data.shape);
		if(data.rotation && this.canRotate){
			this.rotation = new THREE.Euler(data.rotation.x,data.rotation.y,data.rotation.z);
		}
		else this.rotation = new THREE.Euler();
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
		// delete this;
		blockPool.free(this);
	},
	getNeighbor: function(v){
        if(_.isArray(v)) v = new THREE.Vector3().fromArray(v);
		v.sign();
		var pos = v.clone().add(this.position);

       	var chunk = this.chunk;
        if(pos.x < 0 || pos.y < 0 || pos.z < 0 || pos.x >= config.CHUNK_SIZE || pos.y >= config.CHUNK_SIZE || pos.z >= config.CHUNK_SIZE){
        	chunk = chunk.getNeighbor(v.clone());
        	if(!chunk) return; //dont go any futher if we cant find the chunk
        }

        if(this.edge){
	        if(pos.x < 0) pos.x=9;
	        if(pos.y < 0) pos.y=9;
	        if(pos.z < 0) pos.z=9;
	        if(pos.x >= config.CHUNK_SIZE) pos.x=0;
			if(pos.y >= config.CHUNK_SIZE) pos.y=0;
			if(pos.z >= config.CHUNK_SIZE) pos.z=0;
        }

        return chunk.getBlock(pos);
	}
};
var blockCol = new CollisionEntity({
	box: new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(config.BLOCK_SIZE,config.BLOCK_SIZE,config.BLOCK_SIZE)),
	group: 'block'
});
function blockDataGet(prop){
	return {
		get: function(){
			if(this.shape && this.shape.blockData.hasOwnProperty(prop)) return this.shape.blockData[prop];
			if(this.material && this.material.blockData.hasOwnProperty(prop)) return this.material.blockData[prop];
			return this.data[prop];
		}
	};
}
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
			return (this.chunk)? this.chunk.position.clone().multiplyScalar(config.CHUNK_SIZE).add(this.position) : new THREE.Vector3();
		}
	},
	scenePosition: {
		get: function(){
			return this.worldPosition.multiplyScalar(config.BLOCK_SIZE);
		}
	},
	sceneCenter: {
		get: function(){
			return this.scenePosition.add(this.center);
		}
	},
	center: {
		get: function(){
			return new THREE.Vector3(0.5,0.5,0.5).multiplyScalar(config.BLOCK_SIZE);
		}
	},
	edge: {
		get: function(){
			if(!(this.position.x > 0 && this.position.y > 0 && this.position.z > 0 && this.position.x < config.CHUNK_SIZE-1 && this.position.y < config.CHUNK_SIZE-1 && this.position.z < config.CHUNK_SIZE-1)){
				return new THREE.Vector3(
					this.position.x === 0? -1 : (this.position.x == config.CHUNK_SIZE-1)? 1 : 0,
					this.position.y === 0? -1 : (this.position.y == config.CHUNK_SIZE-1)? 1 : 0,
					this.position.z === 0? -1 : (this.position.z == config.CHUNK_SIZE-1)? 1 : 0
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
					if(b.transparent){
						visible = true;
						continue;
					}
					continue;
				}
				visible = true;
			}

			// this._visible = visible;
			return visible;
		}
	},

	//block data
	transparent: blockDataGet('transparent'),
	canRotate: blockDataGet('canRotate'),
	canRotateOnY: blockDataGet('canRotateOnY'),
	canCollide: blockDataGet('canCollide'),
	stepSound: blockDataGet('stepSound'),
	placeSound: blockDataGet('placeSound'),
	removeSound: blockDataGet('removeSound')
});
Block.prototype.constructor = Block;

var blockPool = new InstancePool(Block,true);

export {blockPool, blockDataGet};

// import Materials after we export block since we only need this to run the Block class
import {Materials} from './materials.js';
