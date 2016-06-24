import THREE from 'three';

/**
 * @name VoxelChunk
 * @class
 * @extends {THREE.Group}
 * @param   {Object} [data] - an optional json object to pass to {@link VoxelChunk#fromJSON}
 */
export default class VoxelChunk extends THREE.Group{
	constructor(data){
		super();

		/**
		 * a Map of VoxelBlock with the keys being a string "x,y,z"
		 * @var {Map}
		 * @private
		 */
		this.blocks = new Map();

		/**
		 * a WeakMap of THREE.Vector3 with the keys being the blocks
		 * @private
		 * @var {WeakMap}
		 */
		this.blocksPositions = new WeakMap();

		/**
		 * @private
		 * @var {THREE.Mesh}
		 */
		this.mesh;

		/**
		 * this is read by the parent map, and if its true it will trigger {@link VoxelChunk#build}
		 * @private
		 * @var {Boolean}
		 */
		this.needsBuild = false;

		/**
		 * a THREE.MultiMaterial thats made up of all the blocks materials
		 * @var {THREE.MultiMaterial}
		 * @private
		 */
		this.material = undefined;

		/**
		 * a Set of all the materials on all the blocks in this chunk
		 * @type {Set}
		 */
		this.materials = new Set();
	}

	/**
	 * updates the geometry and material for this chunk, based on the blocks
	 * @return {this}
	 */
	build(){
		if(this.mesh){
			this.remove(this.mesh);
			this.mesh.geometry.dispose();
			this.mesh = undefined;
		}

		//dont build if we are empty
		if(this.empty) return;

		let geometry = new THREE.Geometry();

		//filter all the blocks
		let blocks = Array.from(this.blocks).map(b => b[1]).filter(block => block.visible);

		//get all the materials
		this.materials.clear();
		for(let block of blocks){
			if(block.material instanceof THREE.MultiMaterial){
				block.material.materials.forEach(mat => this.materials.add(mat));
			}
			else if(block.material instanceof THREE.Material){
				this.materials.add(block.material);
			}
		}

		//update or create the mat
		if(this.material){
			this.material.materials = Array.from(this.materials);
			this.material.needsUpdate = true;
		}
		else{
			this.material = new THREE.MultiMaterial(Array.from(this.materials));
		}

		//merge the geometries
		for(let block of blocks){
			let pos = block.position.clone().add(new THREE.Vector3(0.5,0.5,0.5));
			let matrix = new THREE.Matrix4();
			matrix.makeRotationFromEuler(block.rotation);
			matrix.setPosition(pos);

			if(block.material instanceof THREE.MultiMaterial){
				geometry.merge(block.geometry, matrix, this.material.materials.indexOf(block.material.materials[0]));
			}
			else if(block.material instanceof THREE.Material){
				geometry.merge(block.geometry, matrix, this.material.materials.indexOf(block.material));
			}
		}

		geometry.mergeVertices();
		geometry.normalsNeedUpdate = true;
		geometry.computeFaceNormals();

		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.scale.multiply(this.blockSize);
		this.add(this.mesh);

		this.needsBuild = false;
	}

	/**
	 * returns the block at "position".
	 * if the Vector3 is negative it will get the block from the edge of the chunk
	 * @param  {(THREE.Vector3|String)} position
	 * @return {VoxelBlock}
	 */
	getBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3){
			pos = pos.clone().round();
			return this.blocks.get(pos.toArray().join(','));
		}
	}

	/**
	 * returns the position of the block in this chunk
	 * @param  {VoxelBlock} block
	 * @return {THREE.Vector3}
	 */
	getBlockPosition(block){
		return this.blocksPositions.get(block);
	}

	/**
	 * @param {VoxelBlock} block
	 * @param {(THREE.Vector3|String)} posision
	 * @returns {this}
	 */
	setBlock(block,pos){
		if(String.isString(block))
			block = this.map && this.map.blockManager.createBlock(block);

		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		if(pos instanceof THREE.Vector3 && block instanceof VoxelBlock){
			pos = pos.clone().round();
			this.blocks.set(pos.toArray().join(','),block);
			this.blocksPositions.set(block, pos);

			block.chunk = this;

			//tell the map that we need to rebuild this chunk
			this.needsBuild = true;
		}

		return this;
	}

	/**
	 * removes block at pos
	 * @param  {(THREE.Vector3|String)} pos
	 * @return {this}
	 */
	removeBlock(pos){
		//string to vector
		if(String.isString(pos))
			pos = new THREE.Vector3().fromArray(pos.split(','));

		let block = this.getBlock(pos);
		if(pos instanceof THREE.Vector3 && block instanceof VoxelBlock){
			pos = pos.clone().round();
			this.blocks.delete(pos.toArray().join(','));
			this.blocksPositions.delete(block);

			block.chunk = undefined;

			//tell the map that we need to rebuild this chunk
			this.needsBuild = true;
		}

		return this;
	}

	/**
	 * @param  {THREE.Vector3} direction - the direction to check
	 * @return {VoxelChunk}
	 */
	getNeighbor(dir){
		if(this.map && dir instanceof THREE.Vector3){
			return this.map.getChunk(this.chunkPosition.clone().add(dir))
		}
	}

	/**
	 * exports chunk to json format
	 * @return {Object}
	 */
	toJSON(){
		let json = {};

		// blocks array looks like this
		/*
			[['x,y,z',block.toJSON()], ['x,y,z',block.toJSON()], ['x,y,z',block.toJSON()]]
		 */
		json.blocks = Array.from(this.blocks).map(block => {
			block[1] = block[1].toJSON();
			return block;
		});
		return json;
	}

	/**
	 * imports chunk from json
	 * @param  {Object} json
	 * @return {this}
	 */
	fromJSON(json){
		if(json.blocks){
			json.blocks.forEach(data => {
				let type = data[1].type;
				let blockClass = this.map.blockManager.getBlock(type);
				if(blockClass){
					let block = new blockClass();
					this.setBlock(block,data[0]);
					block.fromJSON(data[1]);
				}
			})
		}

		return this;
	}

	/**
	 * @readOnly
	 * @type {Boolean}
	 */
	get empty(){
		return !this.blocks.size;
	}

	/**
	 * returns the position of this chunk (in chunk)
	 * @return {THRE.Vector3}
	 */
	get chunkPosition(){
		return this.map? this.map.getChunkPosition(this) : new THREE.Vector3();
	}

	/**
	 * returns the position of the chunk in the map (in blocks)
	 * @readOnly
	 * @var {THREE.Vector3}
	 */
	get worldPosition(){
		return this.chunkPosition.clone().multiply(this.chunkSize);
	}

	/**
	 * returns the position of the chunk in the scene
	 * @return {THREE.Vector3}
	 */
	get scenePosition(){
		return this.chunkPosition.clone().multiply(this.chunkSize).multiply(this.blockSize);
	}

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
}

//import block for runtime
import VoxelBlock from './VoxelBlock.js';
