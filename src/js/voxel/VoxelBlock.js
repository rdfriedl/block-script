import THREE from 'three';

/**
 * @class the base class for all blocks
 * @name VoxelBlock
 * @param {Object} [data] - an optional json object to pass to {@link VoxelBlock.fromJSON}
 * @param {Object} data.parameters a Object to be passed to {@link VoxelBlock.setParameters}
 */
export default class VoxelBlock{
	constructor(data){
		/**
		 * the rotation of the block
		 * @var {THREE.Euler}
		 */
		this.rotation = new THREE.Euler();

		/**
		 * the chunk we belong to
		 * @type {VoxelChunk}
		 */
		this.chunk = undefined;

		/**
		 * if we are at the edge of the chunk
		 * @type {Boolean}
		 */
		this.edge = false;
		if(this.position.x == 0 ||
			this.position.y == 0 ||
			this.position.z == 0 ||
			this.position.x >= this.chunkSize-1 ||
			this.position.y >= this.chunkSize-1 ||
			this.position.z >= this.chunkSize-1){

			this.edge = true;
		}

		/**
		 * an object that holds the parameters for this class of block
		 * @name parameters
		 * @type {Object}
		 * @private
		 * @memberOf VoxelBlock#
		 */
		this.parameters;// = {};

		if(data)
			this.fromJSON(data);
	}

	/**
	 * @param  {THREE.Vector3} direction - the direction to check
	 * @return {VoxelBlock}
	 */
	getNeighbor(dir){
		if(!this.chunk) return;

		var pos = dir.clone().add(this.position);

		let chunk = this.chunk;
        if(pos.x < 0 || pos.y < 0 || pos.z < 0 || pos.x >= this.chunkSize.x || pos.y >= this.chunkSize.y || pos.z >= this.chunkSize.z){
        	chunk = chunk.getNeighbor(dir);
        	if(!chunk) return; //dont go any futher if we cant find the chunk
        }

        if(pos.x >= this.chunkSize.x) pos.x -= this.chunkSize.x;
		if(pos.y >= this.chunkSize.y) pos.y -= this.chunkSize.y;
		if(pos.z >= this.chunkSize.z) pos.z -= this.chunkSize.z;

        return chunk.getBlock(pos);
	}

	/**
	 * returns a parameter with "id"
	 * @param  {String} id
	 * @return {*}
	 */
	getParameter(id){
		return this.parameters && this.parameters[id];
	}

	/**
	 * sets a parameter with id to value
	 * @param {String|Object} id the id of the parameter to set, or a key value map. with the key being the id
	 * @param {*} [value] the value to set the parameter to
	 * @returns {this}
	 */
	setParameter(id,value){
		if(!this.parameters) this.parameters = {};

		if(Object.isObject()){
			for(let i in id){
				this.parameters[i] = id[i];
			}
		}
		else{
			this.parameters[id] = value;
		}

		this.UpdateParameters();
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
			rotation: this.rotation.toArray(),
			parameters: this.parameters? this.parameters : {}
		};
	}

	/**
	 * @param {Object} json
	 * @param {Number[]} json.rotation the rotation of the block, in format [x,y,z]
	 * @param {Object} json.parameters an object to pass to {@link VoxelBlock.setParameters}
	 * @return {this}
	 */
	fromJSON(json){
		if(json.rotation)
			this.rotation = new THREE.Euler().fromArray(json.rotation);

		if(json.parameters)
			this.setParameters(json.parameters);

		return this;
	}

	/**
	 * the position of the block in the chunk
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get position(){
		return this.chunk? this.chunk.getBlockPosition(this) : new THREE.Vector3();
	}

	/**
	 * the position of this block, in blocks, reletive to the VoxelMap
	 * @type {THREE.Vector3}
	 * @readOnly
	 */
	get worldPosition(){
		return (this.chunk)? this.chunk.chunkPosition.clone().multiply(this.chunkSize).add(this.position) : new THREE.Vector3();
	}

	/**
	 * the position of this block reletive to the scene
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
		let b, sides = [
			[1,0,0],
			[0,1,0],
			[0,0,1],
			[-1,0,0],
			[0,-1,0],
			[0,0,-1]
		];

		for (let i = 0; i < sides.length; i++) {
			b = this.getNeighbor(new THREE.Vector3().fromArray(sides[i]));
			if(b instanceof VoxelBlock){
				if(b.data.transparent){
					visible = true;
					continue;
				}
				continue;
			}
			visible = true;
		}

		return visible;
	}

	/**
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
		return this.map? this.map.blockSize : new THREE.Vector3();
	}

	/**
	 * returns the chunkSize of the map
	 * @return {ThREE.Vector3}
	 * @readOnly
	 */
	get chunkSize(){
		return this.map? this.map.chunkSize : new THREE.Vector3();
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
			this.constructor._materialCache = this.CreateMaterial();;
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
	 * this is called from {@link VoxelBlock.setParameter} and {@link VoxelBlock.setParameters}
	 * @private
	 */
	UpdateParameters(){}
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
VoxelBlock.prototype.data = {
	transparent: false,
	canCollide: true,
	canRotate: true,
	canRotateOnY: true,
	stepSound: [],
	placeSound: [],
	removeSound: []
}
