import THREE from 'three';
import _ from 'underscore';
import fn from '../lib/functions.js';
import Events from '../lib/minvents.js';
import Chunk from './chunk.js';
import {ChunkGeneratorBlank} from './chunkGenerator.js';
import {Materials} from './materials.js';
import * as config from './config.js';

export default function VoxelMap(state,options,materials){
	this.state = state;
	fn.combindIn(this,options);
	this.chunks = {};
	this.events = new Events();

	this.materials = materials || new Materials();

	this.group = new THREE.Group();
	this.state.scene.add(this.group);

	this.debugGroup = new THREE.Group();
	this.state.scene.add(this.debugGroup);

	this.collisionGroup = new THREE.Group();
	this.state.scene.add(this.collisionGroup);

	this.chunkGenerator = new ChunkGeneratorBlank();

	this.debug = false;
}
VoxelMap.prototype = {
	chunks: {},
	mapLoader: undefined,
	chunkGenerator: undefined,
	materials: undefined,
	group: undefined,
	debugGroup: undefined,
	collisionGroup: undefined,
	events: undefined,
	/*
	chunkLoaded
	chunkSaved
	*/
	getChunk: function(position,cb){
		var id = position.toString();
		if(this.chunks[id]){
			//see if its loading
			if(!this.chunks[id].loading){
				if(cb) cb(this.chunks[id]);
				return this.chunks[id];
			}
			else{
				this.chunks[id].events.on('load',cb || function(){});
			}
		}
		else{
			return this.loadChunk(position,cb);
		}
	},
	getBlock: function(position){
		var chunkPos = position.clone();
		chunkPos.divideScalar(config.CHUNK_SIZE);
		chunkPos.floor();

		var chunkID = chunkPos.toString();
		if(this.chunks[chunkID]){
			var chunk = this.chunks[chunkID];
			var pos = position.clone();
			pos.sub(chunk.worldPosition);
			return chunk.blocks[positionToIndex(pos,config.CHUNK_SIZE)];
		}
	},
	setBlock: function(position,data,cb,dontBuild){
		var chunkPos = position.clone();
		chunkPos.divideScalar(config.CHUNK_SIZE);
		chunkPos.floor();

		this.getChunk(chunkPos,function(chunk){
			var pos = position.clone();
			pos.sub(chunk.worldPosition);
			var block = chunk.setBlock(pos,data,dontBuild);
			if(cb) cb(block);
		}.bind(this));
	},
	removeBlock: function(position,cb,dontBuild){
		var chunkPos = position.clone();
		chunkPos.divideScalar(config.CHUNK_SIZE);
		chunkPos.floor();

		this.getChunk(chunkPos,function(chunk){
			var pos = position.clone();
			pos.sub(chunk.worldPosition);
			chunk.removeBlock(pos,dontBuild);
			if(cb) cb();
		}.bind(this));
	},
	loadChunk: function(position,cb){
		var id = position.toString();
		var chunk = new Chunk(position,this);
		chunk.loading = true;

		this.chunks[id] = chunk;

		var func = function(data){
			chunk.loading = false;
			chunk.inportData(data);
			chunk.loaded = true;
			this.events.emit('chunkLoaded',chunk);
			chunk.events.emit('load',chunk);
			if(cb) cb(chunk);
		}.bind(this);

		if(this.mapLoader){
			this.mapLoader.loadChunk(position,function(data){
				if(!data){
					//generate the chunk
					this.chunkGenerator.generateChunk(position,func);
				}
				else{
					func(data);
				}
			}.bind(this));
		}
		else{
			this.chunkGenerator.generateChunk(position,func);
		}
	},
	chunkLoaded: function(position){
		var id = position.toString();
		return !!this.chunks[id];
	},
	saveChunk: function(position,cb){
		if(this.mapLoader){
			this.getChunk(position,function(chunk){
				if(!chunk.saving && !chunk.saved){
					chunk.saving = true;
					this.mapLoader.saveChunk(chunk,function(){
						chunk.saving = false;
						chunk.saved = true;
						this.events.emit('chunkSaved',chunk);
						if(cb) cb();
					}.bind(this));
				}
				else if(cb) cb();
			}.bind(this));
		}
		else if(cb) cb();
	},
	removeChunk: function(position,cb){
		this.getChunk(position,function(chunk){
			chunk.dispose();
			delete this.chunks[position.toString()];
			if(cb) cb();
		}.bind(this));
	},
	unloadChunk: function(position,cb){
		this.saveChunk(position,function(){
			this.removeChunk(position,cb);
		}.bind(this));
	},
	saveAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var j in this.chunks){
			this.chunks[j].save(cb);
		}
		cb();
	},
	removeAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var j in this.chunks){
			this.chunks[j].remove(cb);
		}
		cb();
	},
	unloadAllChunks: function(cb){
		var k = 1;
		for(var i in this.chunks){
			k++;
		}

		cb = _.after(k,cb || function(){});
		for(var j in this.chunks){
			this.chunks[j].unload(cb);
		}
		cb();
	},
	setMapLoader: function(mapLoader,cb){
		if(!mapLoader) return;

		this.mapLoader = mapLoader;
		this.removeAllChunks(cb);
	},
	buildAllChunks: function(cb){
		var func = function(index){
			var length = 0;
			for (var i in this.chunks) {
				length++;
			}

			var k = 0;
			for (var j in this.chunks) {
				if(k++ == index){
					this.chunks[j].build();
				}
			}

			if(index++ > length){
				if(cb) cb();
				return;
			}

			setTimeout(func.bind(this,index),10);
		};
		func.bind(this)(0);
	},
	setChunkGenerator: function(chunkGenerator,cb){
		this.chunkGenerator = chunkGenerator;
		this.removeAllChunks(cb);
	},

	//util functions
	getMapData: function(pos,size){ //exports mapData format
		var data = {
			size: size || new THREE.Vector3(),
			offset: pos || new THREE.Vector3(),
			data: []
		};

		var s = data.size;
		for(var p = new THREE.Vector3(); p.x <= s.x && p.y <= s.y && p.z <= s.z; ){
			var block = this.getBlock(p.clone().add(data.offset));
			if(block)
				data.data.push(block.exportData());
			else
				data.data.push({id:'air'});

			//loop
			if(++p.x > s.x){
				p.x = 0;
				++p.y;
			}
			if(p.y > s.y){
				p.y = 0;
				++p.z;
			}
		}

		return data;
	},
	inportMapData: function(data){ //inports mapData format
		var chunks = {};
		data.size = data.size || new THREE.Vector3();
		data.offset = data.offset || new THREE.Vector3();
		data.data = data.data || [];

		for(var i = 0; i < data.data.length; i++){
			var pos = indexToPosition(i,data.size);
			pos.add(data.offset);
			this.setBlock(pos,data.data[i],null,true);

			pos.divideScalar(config.CHUNK_SIZE).floor();
			chunks[pos.toString()] = pos;
		}

		for(var k in chunks){
			this.getChunk(chunks[k],function(chunk){
				chunk.saved = false;
				chunk.build();
			});
		}
	}
};
Object.defineProperties(VoxelMap.prototype,{
    debug: {
        get: function(){
            return this.debugGroup.visible && this.collisionGroup.visible;
        },
        set: function(val){
        	this.debugGroup.visible = this.collisionGroup.visible = val;
        }
    },
});
