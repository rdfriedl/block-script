import THREE from 'three';

export default function ChunkLoader(map,opts){
	this.position = new THREE.Vector3();
	this.map = map;
	this.timers = [];
	for(var i in opts){
		this[i]=opts[i];
	}
}
ChunkLoader.prototype = {
	position: undefined,
	map: undefined,
	loadRange: 3,
	unloadRange: 4,
	visibleRange: 3,
	enabled: true,
	startTimers: function(){
		//load
		var loadLoop = function(){
			if(this.enabled){
				this._scanLoadChunk(function(){
					setTimeout(loadLoop,20);
				});
			}
			else setTimeout(loadLoop,20);
		}.bind(this);
		loadLoop();

		//save
		var saveLoop = function(){
			if(this.enabled){
				this._scanSaveChunk(function(){
					setTimeout(saveLoop,20);
				});
			}
			else setTimeout(saveLoop,20);
		}.bind(this);
		saveLoop();

		//unload
		var unloadLoop = function(){
			if(this.enabled){
				this._scanUnloadChunk(function(){
					setTimeout(unloadLoop,500);
				});
			}
			else setTimeout(unloadLoop,500);
		}.bind(this);
		unloadLoop();

		//visible
		var visibleLoop = function(){
			if(this.enabled){
				this._scanVisibleChunk(function(){
					setTimeout(visibleLoop,500);
				});
			}
			else setTimeout(visibleLoop,500);
		}.bind(this);
		visibleLoop();
	},
	setRange: function(range){
		this.loadRange = range || this.loadRange;
		this.visibleRange = range || this.visibleRange;
		this.unloadRange = range+1 || this.unloadRange;

		if(this.unloadRange < this.loadRange){
			console.warn('UnloadRange cant be less then LoadRange');
			this.unloadRange = this.loadRange;
		}
	},
	setPosition: function(pos){
		this.position.copy(pos);
	},
	_scanLoadChunk: function(cb){
		var x = 0,
			y = 0,
			z = 0,
			dist = 0;

		while(dist < this.loadRange){
			var loaded = true;
			var position = this.position.clone();
			position.x = Math.floor(position.x / (game.chunkSize*game.blockSize)) + x;
			position.y = Math.floor(position.y / (game.chunkSize*game.blockSize)) + y;
			position.z = Math.floor(position.z / (game.chunkSize*game.blockSize)) + z;

			loaded = (!loaded)? loaded : this.map.chunkLoaded(position);
			loaded = !!loaded;
			if(!loaded){
				this.map.getChunk(position,cb);
				return;
			}
			else{
				if(++y > dist){
					y = -dist;
					x++;
				}
				if(x > dist){
					x = -dist;
					z++;
				}
				if(z > dist){
					z = -dist;
					dist++;
				}

				// delete position, loaded; //jshint ignore: line
			}
		}
		cb();
	},
	_scanSaveChunk: function(cb){
		for(var i in this.map.chunks){
			var chunk = this.map.chunks[i];
			if(!chunk.saved){
				this.map.saveChunk(chunk.position,cb);
				return;
			}
		}
		cb();
	},
	_scanUnloadChunk: function(cb){
		var position = this.position.clone();
		position.x = Math.floor(position.x / (game.chunkSize*game.blockSize));
		position.y = Math.floor(position.y / (game.chunkSize*game.blockSize));
		position.z = Math.floor(position.z / (game.chunkSize*game.blockSize));

		for (var i in this.map.chunks) {
			var chunk = this.map.chunks[i];
			if(
				Math.abs(this.map.chunks[i].position.x - position.x) > this.unloadRange ||
				Math.abs(this.map.chunks[i].position.y - position.y) > this.unloadRange ||
				Math.abs(this.map.chunks[i].position.z - position.z) > this.unloadRange
			){
				chunk.unload();
			}
		}

		// delete position; //jshint ignore: line
		cb();
	},
	_scanVisibleChunk: function(cb){
		var position = this.position.clone();
		position.x = Math.floor(position.x / (game.chunkSize*game.blockSize));
		position.y = Math.floor(position.y / (game.chunkSize*game.blockSize));
		position.z = Math.floor(position.z / (game.chunkSize*game.blockSize));

		for (var i in this.map.chunks) {
			var chunk = this.map.chunks[i];
			if(
				Math.abs(this.map.chunks[i].position.x - position.x) > this.visibleRange ||
				Math.abs(this.map.chunks[i].position.y - position.y) > this.visibleRange ||
				Math.abs(this.map.chunks[i].position.z - position.z) > this.visibleRange
			){
				chunk.visible = false;
			}
			else if(chunk.visible !== true) chunk.visible = true;
		}

		// delete position; //jshint ignore: line
		cb();
	}
};
ChunkLoader.prototype.construtor = ChunkLoader;
