function MapLoader(){
	this.events = new Events();
	this.settings = {
		info: {
			name: '',
			desc: '',
			saved: new Date(),
			created: new Date(),
			screenShot: ''
		},
		player: {
			position: new THREE.Vector3(),
			velocity: new THREE.Vector3()
		}
	};
	this.init.apply(this,arguments).then(function(){
		this.loadSettings().then(function(){
			this.events.emit('init');
		}.bind(this));
	}.bind(this));
}
MapLoader.prototype = {
	db: undefined,
	settings: undefined,
	events: undefined,
	/*
	init
	settingsLoaded
	settingsSaved
	chunkLoaded
	chunkSaved
	*/
	init: function(){
		return new Promise(function(resolve,reject){
			resolve();
		}.bind(this));
	},
	loadChunk: function(position,cb){
		return new Promise(function(resolve,reject){
			resolve();
		}.bind(this));
	},
	saveChunk: function(chunk,cb){
		return new Promise(function(resolve,reject){
			resolve();
		}.bind(this));
	},
	countChunks: function(cb){
		return new Promise(function(resolve,reject){
			resolve(0);
			if(cb) cb();
		});
	},
	loadSettings: function(cb){
		return new Promise(function(resolve,reject){
			resolve();
		}.bind(this));
	},
	saveSettings: function(cb){
		return new Promise(function(resolve,reject){
			resolve();
		}.bind(this));
	},
	setSettings: function(settings,dontSave){
		fn.combindOver(this.settings,settings);
		if(!dontSave) return this.saveSettings();
	},
	delete: function(cb){
		return new Promise(function(resolve,reject){
			resolve();
			if(cb) cb();
		});
	},
	checkSettings: function(){
		this.settings.info.created = new Date(this.settings.info.created);
		this.settings.info.saved = new Date(this.settings.info.saved);
	},
	exportSettings: function(){
		return Object.clone(this.settings,true);
	}
};
MapLoader.prototype.constructor = MapLoader;

function MapLoaderDB(){
	MapLoader.apply(this,arguments);
}
MapLoaderDB.prototype = {
	dbName: '',
	dbVersion: 1.2,
	settings: undefined,
	init: function(dbName){
		this.dbName = dbName;
		return new Promise(function(resolve,reject){
			//create db
			this.db = new Dexie(this.dbName);
			this.db.version(this.dbVersion)
				.stores({
					settings: 'id,data',
					chunks: 'id,position,data'
				});

			this.db.open().then(function(){
				resolve();
			}).catch(function(){
				reject();
			});
		}.bind(this));
	},
	loadChunk: function(position,cb){
		return new Promise(function(resolve,reject){
			this.db.chunks.get(position.toString(),function(data){
				if(data){
					if(typeof data.data == 'string'){
						data.data = JSON.parse(data.data);
						this.db.chunks.put({
							id: position.toString(),
							position: position,
							data: data.data
						});
					}
					data = data.data;
				}

				this.events.emit('chunkLoaded',data);
				resolve(data);
				if(cb) cb(data);
			}.bind(this)).catch(reject);
		}.bind(this));
	},
	saveChunk: function(chunk,cb){
		return new Promise(function(resolve,reject){
			this.db.chunks.put({
				id: chunk.position.toString(),
				position: chunk.position,
				data: chunk.exportData()
			}).then(function(){
				this.events.emit('chunkSaved',chunk);
				resolve();
				if(cb) cb();
			}.bind(this)).catch(reject);
		}.bind(this));
	},
	countChunks: function(cb){
		return this.db.chunks.count(function(count){
			if(cb) cb(count);
			return count;
		});
	},
	loadSettings: function(cb){
		return new Promise(function(resolve,reject){
			this.db.settings.toArray(function(a){
				for(var i in a){
					fn.combindOver(this.settings[a[i].id],a[i].data);
				}

				//make sure all the settings are in order
				this.checkSettings();

				this.events.emit('settingsLoaded',this);
				resolve();
				if(cb) cb();
			}.bind(this)).catch(reject);
		}.bind(this));
	},
	saveSettings: function(cb){
		return new Promise(function(resolve,reject){
			var length = 0;
			for(var i in this.settings){
				length++;
			}
			var done = _.after(length+1,function(){
				//make sure all the settings are in order
				this.checkSettings();

				this.events.emit('settingsSaved',this);
				resolve();
				if(cb) cb();
			}.bind(this));

			for(var k in this.settings){
				this.db.settings.put({
					id: k,
					data: this.settings[k]
				}).then(done).catch(reject);
			}
			done();
		}.bind(this));
	},
	delete: function(cb){
		return this.db.delete().then(function(){
			if(cb) cb();
		});
	},
	toJSON: function(cb,progress){
		return new Promise(function(resolve,reject){
			var json = {};

			//settings
			json.settings = Object.clone(this.settings,true);

			//fix settings
			json.settings.info.created = json.settings.info.created.toDateString();
			json.settings.info.saved = json.settings.info.saved.toDateString();

			//build chunks
			json.chunks = [];
			var k = 0;
			this.db.chunks.count(function(numberOfChunks){
				this.db.chunks.each(function(chunk){
					if(progress) progress((k/numberOfChunks)*100);

					json.chunks.push(chunk);

					k++;
				}.bind(this)).then(function(){
					if(progress) progress(100);
					resolve(json);
					if(cb) cb(json);
				});
			}.bind(this)).catch(reject);
		}.bind(this));
	},
	fromJSON: function(json,cb,progress){
		json = (typeof json == 'string')? JSON.parse(json) : json;

		return new Promise(function(resolve,reject){
			//inport settings
			this.setSettings(json.settings);

			//load chunks
			var func = function(i){
				if(progress) progress((i/json.chunks.length) * 100);

				var chunk = json.chunks[i];
				if(!chunk.position) chunk.position = new THREE.Vector3().fromString(chunk.id);
				chunk.position.x = parseInt(chunk.position.x);
				chunk.position.y = parseInt(chunk.position.y);
				chunk.position.z = parseInt(chunk.position.z);
				var pos = new THREE.Vector3().set(chunk.position.x,chunk.position.y,chunk.position.z);
				this.db.chunks.put({
					id: pos.toString(),
					position: pos,
					data: chunk.data
				});

				if(++i < json.chunks.length){
					setTimeout(func.bind(this,i),1);
				}
				else{
					if(progress) progress(100);
					resolve();
					if(cb) cb();
				}
			};
			func.bind(this)(0);
		}.bind(this));
	}
};
MapLoaderDB.prototype.__proto__ = MapLoader.prototype;
MapLoaderDB.prototype.constructor = MapLoaderDB;
