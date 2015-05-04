function MapLoader(settings,cb){
	this.booting = true;
	this.events = new Events();

	this.settings = {
		info: {
			dbName: 'map'
		}
	};
	fn.combindOver(this.settings.info,settings);

	//set up db
	this.db = new Dexie(this.settings.info.dbName);
	this.db.version(this.dbVersion)
		.stores({
			settings: 'id,data',
			chunks: 'id,position,data'
		})

	this.db.open().finally(function(){
		this.booting = false;

		this.loadSettings(function(){
			//save the settings just in case its a new map
			this.saveSettings(function(){
				if(cb) cb(this);
			}.bind(this));
		}.bind(this));
	}.bind(this));

	this.db.on('error',function(err){
		console.log(err);
	});
}
MapLoader.prototype = {
	dbVersion: 1.2,
	booting: false,
	db: undefined,
	settings: {},
	events: undefined,
	loadChunk: function(position,cb){
		this.db.chunks.get(position.toString(),function(data){
			if(data){
				if(typeof data.data == 'string'){
					data.data = JSON.parse(data.data);
					this.db.chunks.put({
						id: position.toString(),
						position: position,
						data: data.data
					})
				}
				data = data.data;
			}
			this.events.emit('loadChunk',data);
			if(cb) cb(data);
		}.bind(this))
	},
	saveChunk: function(chunk,cb){
		this.db.chunks.put({
			id: chunk.position.toString(),
			position: chunk.position,
			data: chunk.exportData()
		}).finally(function(){
			this.events.emit('saveChunk',chunk);
			if(cb) cb();
		}.bind(this));
	},
	loadSettings: function(cb){
		this.db.settings.toArray(function(a){
			for(var i in a){
				fn.combindOver(this.settings[a[i].id],a[i].data);
			}

			this.events.emit('loadSettings',this);
			if(cb) cb();
		}.bind(this))
	},
	saveSettings: function(cb){
		var length = 0;
		for(var i in this.settings){
			length++;
		}
		cb = _.after(length+1,function(){
			this.events.emit('saveSettings',this);
			if(cb) cb();
		}.bind(this));

		for(var i in this.settings){
			this.db.settings.put({
				id: i,
				data: this.settings[i]
			}).finally(cb);
		}
		cb();
	},
	exportData: function(cb,progress){ //NOTE: disabled settings
		var json = {
			settings: this.settings,
			chunks: []
		}
		//build chunks
		var k = 0;
		this.db.chunks.count(function(numberOfChunks){
			this.db.chunks.each(function(chunk){
				if(progress) progress((k/numberOfChunks)*100);

				for(var i in chunk.data){
					chunk.data[i] = chunk.data[i].id;
				}

				json.chunks.push(chunk);

				k++;
			}.bind(this)).finally(function(){
				if(progress) progress(100);
				if(cb) cb(json.chunks);
			})
		}.bind(this));
	},
	inportData: function(data,cb,progress){ //NOTE: disabled settings
		var json = (typeof data == 'string')? JSON.parse(data) : data;

		//load settings
		// fn.combindOver(this.settings,json.settings || {});
		//fix dates
		// this.settings.info.createDate = new Date(this.settings.info.createDate);
		// this.settings.info.lastSave = new Date(this.settings.info.lastSave);
		// this.saveSettings();

		//load chunks
		var func = function(i){
			// if(progress) progress((i/json.chunks.length) * 100);
			if(progress) progress((i/json.length) * 100);

			// var chunk = json.chunks[i];
			var chunk = json[i];
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

			// if(++i < json.chunks.length){
			if(++i < json.length){
				setTimeout(func.bind(this,i),1);
			}
			else{
				if(cb) cb();
			}
		}
		func.bind(this)(0);
	}
};