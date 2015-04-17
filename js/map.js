function Map(state,options){
	this.state = state;
	fn.combindIn(this,options);
	this.chunks = {};

	this.group = new THREE.Group();
	this.state.scene.add(this.group);
}
Map.prototype = {
	chunks: {},
	mapLoader: undefined,
	chunkGenerator: undefined,
	group: undefined,
	getChunk: function(position,cb){
		var id = position.toString();
		if(this.chunks[id]){
			if(cb) cb(this.chunks[id]);
			return this.chunks[id];
		}
		else{
			this.loadChunk(position,cb);
		}
	},
	getBlock: function(position){
		//has to be fast so we are not going to go through any other functions
		var chunkPos = position.clone();
		chunkPos.divideScalar(settings.chunkSize);
		chunkPos.floor();

		var chunkID = chunkPos.x+'|'+chunkPos.y+'|'+chunkPos.z;
		if(this.chunks[chunkID]){
			var pos = position.clone();
			pos.sub(chunkPos.multiplyScalar(settings.chunkSize));
			return this.chunks[chunkID].blocks[positionToIndex(pos,settings.chunkSize)];
		}
	},
	loadChunk: function(position,cb){
		if(!this.mapLoader) return;
		var id = position.toString();
		var chunk = new Chunk(position,this);
		chunk.loading = true;

		this.chunks[id] = chunk;

		this.mapLoader.loadChunk(position,function(data){
			if(!data){
				//generate the chunk
				this.chunkGenerator.generateChunk(position,function(data){
					chunk.loading = false;
					chunk.inportData(data);
					if(cb) cb(chunk);
				})
			}
			else{
				chunk.loading = false;
				chunk.inportData(data);
				if(cb) cb(chunk);
			}
		}.bind(this))
	},
	chunkLoaded: function(position){
		var id = position.toString();
		return !!this.chunks[id];
	},
	saveChunk: function(position,cb){
		this.getChunk(position,function(chunk){
			if(!chunk.saving && !chunk.saved){
				chunk.saving = true;
				this.mapLoader.saveChunk(chunk,function(){
					chunk.saving = false;
					chunk.saved = true;
					if(cb) cb();	
				});
			}
			else if(cb) cb();
		}.bind(this))
	},
	removeChunk: function(position,cb){
		this.getChunk(position,function(chunk){
			chunk.dispose();
			delete this.chunks[position.toString()];
			if(cb) cb();
		}.bind(this))
	},
	unloadChunk: function(position,cb){
		this.saveChunk(position,function(){
			this.removeChunk(position,cb);
		}.bind(this))
	},
	saveAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var i in this.chunks){
			this.chunks[i].save(cb);
		}
		cb();
	},
	removeAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var i in this.chunks){
			this.chunks[i].remove(cb);
		}
		cb();
	},
	unloadAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var i in this.chunks){
			this.chunks[i].unload(cb);
		}
		cb();
	},
	setMapLoader: function(mapLoader,cb){
		if(!mapLoader) return;

		this.mapLoader = mapLoader;
		this.removeAllChunks(cb);
	},
	setChunkGenerator: function(chunkGenerator,cb){
		this.chunkGenerator = chunkGenerator;
		this.removeAllChunks(cb);
	}
}