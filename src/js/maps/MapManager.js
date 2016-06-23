import Dexie from 'dexie';
import MapLoader from './MapLoader.js';
import MapLoaderIndexedDB from './MapLoaderIndexedDB.js';

/**
 * main class that manages the maps
 */
export default class MapManager{
	/**
	 * returns a instance of MapManager
	 * @static
	 * @return {MapManager}
	 */
	static get inst(){return this._inst || (this._inst = new this())}

	constructor(){
		this.mapLoaders = {};

		this._init = new Promise((resolve, reject) => {
			//set up map list database
			this.db = new Dexie('block-script-maps');

			// versions
			this.db.version(1).stores({
				maps: '++id, type, database'
			});

			this.db.open().then(() => {
				this._init = undefined;
				resolve();
			});
		});
	}

	/**
	 * returns a promise that resolves when the manager is finished setting up
	 * @private
	 * @return {Promise}
	 */
	_waitOnInit(){
		if(this._init)
			return this._init;
		else
			return Promise.resolve();
	}

	/**
	 * returns a list of map ids
	 * @return {Promise}
	 */
	listMaps(){
		return this._waitOnInit().then(() => {
			return this.db.maps.toArray(arr => arr.map(map => map.id));
		});
	}

	/**
	 * returns the MapLoader for the map with "id"
	 * @param  {String} id - The ID of the map
	 * @return {Promise} resolves after MapLoader.init & MapLoader.loadData are called
	 */
	getMapLoader(id){
		if(this.mapLoaders[id]){
			return Promise.resolve(this.mapLoaders[id]);
		}
		else{
			return new Promise(resolve => {
				//load it
				this._waitOnInit().then(() => {
					this.db.maps.get(id).then(data => {
						//create loader
						switch(data.type){
							case 'indexedDB':
								//create, set up the loader, and return it
								new MapLoaderIndexedDB().init(data.database).then(loader => {
									this.mapLoaders[id] = loader;
									resolve(loader);
								});
								break;
							default:
								throw new Error('could not load map of type: ',type);
								break;
						}
					})
				})
			})
		}
	}

	/**
	 * deletes the map with "id"
	 * @param  {String} id
	 * @return {Promise}
	 */
	deleteMap(id){
		return new Promise(resolve => {
			this._waitOnInit().then(() => {
				//get the map loader so we can delete it
				this.getMapLoader(id).then(loader => {
					loader.delete().then(() => {
						//remove it from the db
						this.db.maps.delete(id).then(() => {
							//remove it from cache
							this.mapLoaders[id] = undefined;

							resolve();
						})
					})
				})
			})
		})
	}

	/**
	 * @param  {String} type - The type of map loader to use (indexedDB)
	 * @param  {Object} data - The data to set on the map
	 * @return {Promise}
	 */
	createMap(type, data){
		return new Promise(resolve => {
			let id = Math.round(Math.random() * 100000);
			let loader;
			switch(type){
				case 'indexedDB':
					loader = new MapLoaderIndexedDB();
					loader.init('block-script-map-'+id);
					break;
				default:
					throw new Error('cant create map with type: ',type);
					return;
					break;
			}

			loader.once('init', () => {
				for(let i in data)
					loader.data[i] = data[i];

				loader.data.id = id;

				Promise.all([
					loader.saveData(),
					this.db.maps.put({
						id: id,
						type: type,
						database: 'block-script-map-'+id
					})
				]).then(() => resolve(loader));
			})

			this.mapLoaders[id] = loader;
		})
	}
}
