import THREE from 'three';
import Events from 'event-emitter';

/**
 * base class for all MapLoaders
 * @name MapLoader
 * @class
 * @extends {Events}
 */
export default class MapLoader extends Events{
	constructor(...args){
		super();

		/**
		 * the main data object, this is used to store info about the map (name, dateCreated, ...)
		 * @type {Object}
		 */
		this.data = {};
	}

	/* Events:
	init
	dataLoaded: (data)
	dataSaved
	chunkLoaded: (chunkData)
	chunkSaved: (chunk)
	*/

	/**
	 * sets up the loader and loads the data
	 * @returns {Promise}
	 */
	init(...args){
		return this.Init(...args) //set up map
			.then(() => this.loadData() //load data
					.then(() => this.emit('init'))); //fire event
	}

	/**
	 * loads a chunk at "position"
	 * @param {THREE.Vector3} position - The position of the chunk to load
	 * @returns {Promise} promise resolves with chunk data
	 */
	loadChunk(position){
		return this.LoadChunk(position).then(chunkData => this.emit('chunkLoaded', chunkData));
	}

	/**
	 * saves a chunk
	 * @param {Chunk} chunk - The chunk to save
	 * @returns {Promise} promise resolves when chunk is done saving
	 */
	saveChunk(chunk){
		return this.LoadChunk(chunk).then(() => this.emit('chunkSaved', chunk));
	}

	/**
	 * returns the chunk of chunks saved in this loader
	 * @returns {Promise} resolves with number of chunks
	 */
	countChunks(){
		return Promise.resolve(0);
	}

	/**
	 * deletes the map
	 * @returns {Promise} resolves when when map is deleted
	 */
	delete(){
		return this.Delete();
	}

	/**
	 * loads the data and stores it in this.data
	 * @return {Promise} resolves when data is done loading
	 */
	loadData(){
		return this.LoadData().then(data => {
			if(Object.isObject(data)){
				this.data = data;
				this.emit('dataLoaded', data);

				return this.data;
			}
			else
				throw new Error('data not object');
		})
	}

	/**
	 * @return {Promise}
	 */
	saveData(){
		return this.SaveData(this.data);
	}

	// Handles
	Init(...args){return Promise.resolve()}
	LoadChunk(position){return Promise.resolve()}
	SaveChunk(chunk){return Promise.resolve()}
	CountChunks(){return Promise.resolve()}
	Delete(){return Promise.resolve()}

	// returns data object
	LoadData(){return Promise.resolve()}

	// saves data object
	SaveData(data){return Promise.resolve()}
}
