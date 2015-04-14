map = {
	chunkSize: 10,
	blockSize: 32,
	chunks: {},
	mapLoader: undefined, //a map loader object
	group: new THREE.Group(),
	init: function() {
		scene.add(this.group);
	},
	getChunk: function(position,cb){
		var id = position.x+'|'+position.y+'|'+position.z;
		if(this.chunks[id]){
			if(cb) cb(this.chunks[id]);
		}
		else{
			this.loadChunk(position,cb);
		}
	},
	getBlock: function(position){
		//has to be fast so we are not going to go through any other functions
		var chunkPos = position.clone();
		chunkPos.divideScalar(map.chunkSize);
		chunkPos.floor();

		var chunkID = chunkPos.x+'|'+chunkPos.y+'|'+chunkPos.z;
		if(this.chunks[chunkID]){
			var pos = position.clone();
			pos.sub(chunkPos.multiplyScalar(map.chunkSize));
			return this.chunks[chunkID].blocks[positionToIndex(pos,map.chunkSize)];
		}
	},
	loadChunk: function(position,cb){
		if(!this.mapLoader) return;
		var id = position.x+'|'+position.y+'|'+position.z;
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
		var id = position.x+'|'+position.y+'|'+position.z;
		return !!this.chunks[id];
	},
	saveChunk: function(position,cb){
		this.getChunk(position,function(chunk){
			this.mapLoader.saveChunk(chunk,cb);
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
	removeChunk: function(position,cb){
		this.getChunk(position,function(chunk){
			chunk._remove();
			delete this.chunks[position.x+'|'+position.y+'|'+position.z];
			if(cb) cb();
		}.bind(this))
	},
	removeAllChunks: function(cb){
		for(var i in this.chunks){
			this.chunks[i].remove();
		}

		if(cb) cb();
	},
	saveChunkLoop: function(i){
		var k=0;
		for(var chunk in this.chunks){
			if(k==i){
				this.mapLoader.saveChunk(this.chunks[k]);
				break;
			}
			k++;
		}
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

map.blocks = [

]