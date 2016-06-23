import THREE from 'three';
import MapLoader from './MapLoader.js';
import Dexie from 'dexie';

/**
 * MapLoader for loading maps from local databases
 * @extends {MapLoader}
 */
export default class MapLoaderIndexedDB extends MapLoader{
	/**
	 * @name init
	 * @param {String} name - The name of the local database
	 */
	Init(name){
		return new Promise((resolve, reject) => {
			//create db
			this.db = new Dexie(name);

			// set up versions
			this.db.version(1.3)
				.stores({
					data: 'id, data',
					chunks: 'id, position, data'
				})
				.upgrade((trans) => {
					trans.settings.toArray(arr => {
						trans.data.bulkPut(arr);
					});
				});

			this.db.version(1.2)
				.stores({
					settings: 'id, data',
					chunks: 'id, position, data'
				});

			this.db.open()
				.then(() => resolve(this.db))
				.catch(err => reject(err));
		});
	}

	// Handles
	LoadChunk(position){
		return new Promise((resolve,reject) => {
			this.db.chunks.get(position.toString(), chunkData => {
				if(chunkData && chunkData.data)
					resolve(data);
				else
					reject(new Error('no chunk data'));
			});
		});
	}
	SaveChunk(chunk){
		return new Promise((resolve,reject) => {
			this.db.chunks.put({
				id: chunk.position.toString(),
				position: chunk.position,
				data: chunk.exportData()
			}).then(() => resolve());
		});
	}
	CountChunks(){
		return this.db.chunks.count();
	}
	Delete(){
		return this.db.delete();
	}
	LoadData(){
		return this.db.data.toArray(arr => {
			let data = {};
			arr.forEach(dataItem => {
				data[dataItem.id] = dataItem.data;
			});
			return data;
		})
	}
	SaveData(data){
		let items = [];
		for(let i in data){
			items.push({
				id: i,
				data: data[i]
			});
		}

		return this.db.data.bulkPut(items);
	}
}
