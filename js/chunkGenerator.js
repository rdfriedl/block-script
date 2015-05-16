ChunkGeneratorBlank = function(){
}
ChunkGeneratorBlank.prototype = {
	levels: [],
	generateChunk: function(position,cb){
		var data = [];

		for (var i = 0; i < game.chunkSize*game.chunkSize*game.chunkSize; i++) {
			data.push(undefined);
		};	

		if(cb) cb(data);
	}
}
ChunkGeneratorBlank.prototype.constructor = ChunkGeneratorBlank;

RoomGenerator = function(){}
RoomGenerator.prototype = {
	levels: [],
	generateChunk: function(position,cb){
		var data = [];

		for (var i = 0; i < game.chunkSize*game.chunkSize*game.chunkSize; i++) {
			var pos = indexToPosition(i,game.chunkSize)//.add(position.clone().multiplyScalar(game.chunkSize));

			if(pos.x == 0 || pos.y == 0 || pos.z == 0){
				if(pos.y < 3 && pos.y > 0 && (pos.x == 5 || pos.z == 5)){
					data.push(undefined);
				}
				else{
					data.push({
						shape: 'cube',
						material: 'stone',
					});
				}
			}
			else{
				data.push(undefined);
			}
		};	

		if(cb) cb(data);
	}
}
RoomGenerator.prototype.constructor = RoomGenerator;

FladGenerator = function(){}
FladGenerator.prototype = {
	levels: [],
	generateChunk: function(position,cb){
		var data = [];

		for (var i = 0; i < game.chunkSize*game.chunkSize*game.chunkSize; i++) {
			var pos = indexToPosition(i,game.chunkSize).add(position.clone().multiplyScalar(game.chunkSize));

			if(pos.y < 10){
				data.push({
					shape: 'cube',
					material: 'stone',
				});
			}
			else{
				data.push(undefined);
			}
		};	

		if(cb) cb(data);
	}
}
FladGenerator.prototype.constructor = FladGenerator;

ChunkGeneratorHills = function(options){
	this.options = fn.combindOver({
		seed: 0,
		levels: [],
	},options);

	for (var i = 0; i < this.options.levels.length; i++) {
		this.levels.push(new Noise(this.options.seed + i));
	};
}
ChunkGeneratorHills.prototype = {
	levels: [],
	noise: undefined,
	cache: {},
	generateChunk: function(position,cb){
		var data = [];

		for (var i = 0; i < game.chunkSize*game.chunkSize*game.chunkSize; i++) {
			var pos = indexToPosition(i,game.chunkSize).add(position.clone().multiplyScalar(game.chunkSize));
			var lvls = this.getHeight(pos.x,pos.z);

			var f = false, l = -1;
			for (var k = 0; k < lvls.length; k++) {
				if(pos.y < lvls[k]){
					l = k;
					break;
				}
			};

			if(l!==-1){
				var a = 0;
				for (var j = 0; j < this.options.levels[l].blocks.length; j++) {
					a += this.options.levels[l].blocks[j].height;
					if(lvls[l] - pos.y <= a){
						f = true;
						data.push({
							shape: 'cube',
							material: this.options.levels[l].blocks[j].block
						});
						break;
					}
				};
			}

			if(!f){
				data.push(undefined);
			}
		};	

		if(cb) cb(data);
	},
	getHeight: function(x, y) {
		if(!this.cache[x+'|'+y]){
			var lvls = [];
			for (var i = 0; i < this.levels.length; i++) {

				var data = 0, q = this.options.levels.quality || 10, fractal = this.options.levels.fractal || 4;
				for (var k = 0; k < fractal; k++) {
					data += this.levels[i].simplex3(x / q, y / q, q) * Math.pow(q, 1/fractal);
					// data += this.levels[i].simplex3(x / q, y / q, i) * Math.pow(q, 1/fractal);

					q *= fractal;
				};

				lvls.push(data);
			};
			this.cache[x+'|'+y] = lvls;
		}
		return this.cache[x+'|'+y];
	}
}
ChunkGeneratorHills.prototype.constructor = ChunkGeneratorHills;