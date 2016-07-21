import THREE from 'three';

const NEIGHBORS_DIRS = [
	[1,0,0],
	[0,1,0],
	[0,0,1],
	[-1,0,0],
	[0,-1,0],
	[0,0,-1]
]

/**
 * @class the base class for all blocks
 * @name VoxelBlock
 * @param {Object} [data] - an optional json object to pass to {@link VoxelBlock.fromJSON}
 * @param {Object} data.properties a Object to be passed to {@link VoxelBlock.setProp}
 */
export default class VoxelBlock{
	constructor(data){
		/**
		 * the chunk we belong to
		 * @type {VoxelChunk|VoxelSelection}
		 */
		this.parent = undefined;

		// check to see if we set up the properties
		if(!this.__proto__.hasOwnProperty('properties')){
			this.constructor._setUpProperties();
		}

		if(data)
			this.fromJSON(data);
	}

	/**
	 * @param  {THREE.Vector3} direction - the direction to check
	 * @return {VoxelBlock}
	 */
	getNeighbor(dir){
		if(!this.parent) return;

		var pos = dir.clone().add(this.position);

		let parent = this.parent;
        // only wrap if we are in a chunk, dont wrap if we are in a selection
        if(this.chunk){
	        if(pos.x < 0 || pos.y < 0 || pos.z < 0 || pos.x >= this.chunkSize.x || pos.y >= this.chunkSize.y || pos.z >= this.chunkSize.z){
	        	parent = parent.getNeighbor(dir);
	        	if(!parent) return; //dont go any futher if we cant find the chunk
	        }

	        if(pos.x >= this.chunkSize.x) pos.x -= this.chunkSize.x;
			if(pos.y >= this.chunkSize.y) pos.y -= this.chunkSize.y;
			if(pos.z >= this.chunkSize.z) pos.z -= this.chunkSize.z;
        }

        return parent.getBlock(pos);
	}

	/**
	 * returns an array of neighbors
	 * @return {VoxelBlock[]}
	 */
	getNeighbors(){
		let a = [];
		let vec = new THREE.Vector3();
		for (let i = 0; i < NEIGHBORS_DIRS.length; i++) {
			a.push(this.getNeighbor(vec.fromArray(NEIGHBORS_DIRS[i])));
		}
		return a;
	}

	/**
	 * returns a parameter with "id"
	 * @param  {String} id
	 * @return {*}
	 */
	getProp(id){
		return this.properties && this.properties[id];
	}

	/**
	 * sets a parameter with id to value
	 * @param {String|Object} id the id of the parameter to set, or a key value map. with the key being the id
	 * @param {*} [value] the value to set the parameter to
	 * @returns {this}
	 */
	setProp(id,value){
		if(!this.hasOwnProperty('parameters'))
			this.properties = Object.create(this.properties);

		if(Object.isObject(id)){
			for(let i in id){
				this.properties[i] = id[i];
			}
		}
		else{
			this.properties[id] = value;
		}

		this.UpdateProps();
		return this;
	}

	/**
	 * exports this block to json format
	 * @return {Object}
	 * @property {String} type the UID of the block
	 * @property {Number[]} rotation the rotation of this object, in format [x,y,z]
	 * @property {Object} parameters an object containing all the parameters of the block
	 */
	toJSON(){
		return {
			type: this.id,
			properties: this.hasOwnProperty('properties')? this.properties : undefined
		};
	}

	/**
	 * @param {Object} json
	 * @param {Number[]} json.rotation the rotation of the block, in format [x,y,z]
	 * @param {Object} json.properties an object to pass to {@link VoxelBlock.setProp}
	 * @return {this}
	 */
	fromJSON(json){
		if(json.properties)
			this.setProp(json.properties);

		return this;
	}

	/**
	 * returns the parent {@link VoxelChunk} if this block is a child of it
	 * @return {VoxelChunk}
	 * @readOnly
	 */
	get chunk(){
		return this.parent instanceof VoxelChunk? this.parent : undefined;
	}

	/**
	 * returns the parent {@link VoxelSelection} if this block is a child of it
	 * @return {VoxelSelection}
	 * @readOnly
	 */
	get selection(){
		return this.parent instanceof VoxelSelection? this.parent : undefined;
	}

	/**
	 * the position of the block in its parent
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get position(){
		return this.parent? this.parent.getBlockPosition(this) : new THREE.Vector3();
	}

	/**
	 * the position of this block, in blocks, reletive to the VoxelMap
	 * this will only work if the block is in a {@link VoxelChunk} that has a {@link VoxelMap}
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get worldPosition(){
		return (this.chunk)? this.chunk.chunkPosition.clone().multiply(this.chunkSize).add(this.position) : new THREE.Vector3();
	}

	/**
	 * the position of this block reletive to the scene
	 * this will only work if the block is in a {@link VoxelChunk} that has a {@link VoxelMap}
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get scenePosition(){
		return (this.chunk)? this.chunk.scenePosition.add(this.position.clone().multiply(this.blockSize)) : new THREE.Vector3();
	}

	/**
	 * the center of this block reletive to the scene
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get sceneCenter(){
		return this.scenePosition.add(this.blockSize.clone().divideScalar(2));
	}

	/**
	 * @type {Boolean}
	 * @readOnly
	 */
	get visible(){
		let visible = false;
		let blocks = this.getNeighbors();
		for(let i in blocks){
			let b = blocks[i];
			if(b instanceof VoxelBlock){
				if(b.properties.transparent){
					visible = true;
					break;
				}
			}
			else{
				visible = true;
				break;
			}
		}

		return visible;
	}

	/**
	 * returns the VoxelMap this block is in
	 * @type {VoxelMap}
	 * @readOnly
	 */
	get map(){
		return this.chunk && this.chunk.map;
	}

	/**
	 * returns the UID of the block
	 * @readOnly
	 * @type {String}
	 */
	get id(){return this.constructor.UID}

	/**
	 * returns the blockSize of the map
	 * @return {ThREE.Vector3}
	 * @readOnly
	 */
	get blockSize(){
		return this.parent? this.parent.blockSize : new THREE.Vector3();
	}

	/**
	 * returns the chunkSize of the map
	 * @return {ThREE.Vector3}
	 * @readOnly
	 */
	get chunkSize(){
		return this.parent? this.parent.chunkSize : new THREE.Vector3();
	}

	/**
	 * the modal used when building the mesh for the chunk
	 * @type {THREE.Geometry}
	 * @readOnly
	 */
	get geometry(){
		if(!this.constructor._geometryCache){
			//create it
			this.constructor._geometryCache = this.CreateGeometry();;
		}
		return this.constructor._geometryCache;
	}

	/**
	 * @readOnly
	 * @type {THREE.Material}
	 */
	get material(){
		if(!this.constructor._materialCache){
			//create it
			this.constructor._materialCache = this.CreateMaterial();
		}
		return this.constructor._materialCache;
	}

	/**
	 * returns the geometry for this type of block.
	 * geometry should be no bigger then 1 x 1 x 1
	 * @private
	 * @returns {THREE.Geometry}
	 */
	CreateGeometry(){
		let geometry = new THREE.BoxGeometry(1,1,1);
		geometry.faces.forEach(f => f.materialIndex = 0);
		return geometry;
	}

	/**
	 * creates the material for this type of block
	 * @private
	 * @returns {THREE.Material}
	 */
	CreateMaterial(){
		return new THREE.MeshNormalMaterial();
	}

	/**
	 * updates the block based on its parameters.
	 * this is called from {@link VoxelBlock.setProp} and {@link VoxelBlock.setProp}
	 * @private
	 */
	UpdateProps(){}

	static _setUpProperties(){
		let _super = this.prototype.__proto__.constructor;
		//make sure we extend a class the has properties
		if(_super._setUpProperties){
			//if my parent dose not have a properties object, create one
			if(!_super.prototype.properties)
				_super._setUpProperties();

			this.prototype.properties = this.hasOwnProperty('DefalutProperties')? this.DefalutProperties : {};
			this.prototype.properties.__proto__ = _super.prototype.properties;
		}
		else{
			this.prototype.properties = this.DefalutProperties || {};
		}
	}
}

/**
 * the unique id of this block
 * @name UID
 * @type {String}
 * @memberOf VoxelBlock
 * @static
 */
VoxelBlock.UID = 'block';

/**
 * options / info about this block
 * @type {Object}
 * @property {Boolean} transparent -
 * 		if you can see other block through this one.
 * 		this is for VoxelChunk when it builds the mesh.
 *
 * @property {Boolean} canCollide -
 * 		if the player collides with this block
 *
 * @property {Boolean} canRotate if this block can be rotated
 * @property {Boolean} canRotateOnY
 * @property {Array} stepSound an array of sound ids to play if the player steps on this block
 * @property {Array} placeSound an array of sound ids to play if the player places this block
 * @property {Array} removeSound an array of sound ids to play if the player destroys this block
 */
VoxelBlock.DefalutProperties = {
	rotation: new THREE.Euler(),
	transparent: false,
	canCollide: true,
	canRotate: true,
	canRotateOnY: true,
	stepSound: [],
	placeSound: [],
	removeSound: []
}

import VoxelChunk from './VoxelChunk.js';
import VoxelSelection from './VoxelSelection.js';
