(function(){
	Folder = Resource.extend(function Folder(){
		Resource.prototype.constructor.apply(this,arguments);
	},{

	}).add()

	Map = Resource.extend(function Map(){
		Resource.prototype.constructor.apply(this,arguments);

		this.mapLoader = new MapLoader({
			dbName: 'block-script-map:' + this.id
		})
	},{
		data: {
			name: '',
			player: {
				position: new THREE.Vector3(),
				velocity: new THREE.Vector3(),
			}
		},
		mapLoader: undefined,

		inportData: function(data){
			Resource.prototype.inportData.apply(this,arguments);
			return data;
		},
		exportData: function(){
			var data = Resource.prototype.exportData.apply(this,arguments);
			data.player.position = {x: this.data.player.position.x, y: this.data.player.position.y, z: this.data.player.position.z};
			data.player.velocity = {x: this.data.player.velocity.x, y: this.data.player.velocity.y, z: this.data.player.velocity.z};
			return data;
		},
		dispose: function(cb){
			this.mapLoader.db.delete();
			if(cb) cb();
		},

		toJSON: function(cb,progress){
			var json = {
				data: this.exportData(),
				chunks: []
			}
			this.mapLoader.exportData(function(data){
				json.chunks = data;
				if(cb) cb(json);
			},progress);
		},
		fromJSON: function(json,cb,progress){
			var json = fn.combindOver({
				data: {},
				chunks: []
			},json);

			this.inportData(json.data);

			this.mapLoader.inportData(json.chunks,cb,progress);
		}
	}).add()

	Script = Resource.extend(function Script(){
		Resource.prototype.constructor.apply(this,arguments);
	},{

	}).add()

	Block = Resource.extend(function Block(){
		Resource.prototype.constructor.apply(this,arguments);
	},{
		data: {
			blockID: '', //id of this block, its used in creating the class
			extend: '', //id of another block resource that this one extends
			blockData: { //data that gose into the block class
			}
		},
		compileClass: function(refreshCache){ //returns a javascript constructor for this block
			if(this.data.blockID == '') return;

			if(!blocks.getBlock(this.data.blockID) || refreshCache){
				//build class
				var block = namedFunction(this.data.blockID,function(position,data,chunk){
					this.position = position || new THREE.Vector3();
					this.chunk = chunk;

					this.inportData(data);
					this.onCreate();
				});

				if(this.data.extend){
					var r = resources.getResource(this.data.extend,true);
					if(r instanceof resources.Block){
						var parentBlock = r.compileClass();
						var diff = fn.getDiff(parentBlock.prototype,this.data.blockData);
						block.prototype = fn.buildDiff(diff);
						block.prototype.__proto__ = parentBlock.prototype;
					}
				}

				if(_.isEmpty(block.prototype)){
					var diff = fn.getDiff(Block.prototype,this.data.blockData);
					block.prototype = fn.buildDiff(diff);
					block.prototype.__proto__ = Block.prototype;
				}

				block.prototype.id = this.data.blockID;
				block.prototype.constructor = block;

				//parse material
				if(block.prototype.material){
					block.prototype.material = materialLoader.parse(block.prototype.material);

					block.prototype.collider = new CollisionEntity({
						box: new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(game.blockSize,game.blockSize,game.blockSize)),
						group: 'block'
					})
				}

				blocks.updateBlock(this.data.blockID,block);
			}

			return blocks.getBlock(this.data.blockID);
		},
		buildMesh: function(){ //returns a mesh that is the block
			
		}
	}).add()

	Room = Resource.extend(function Room(){
		Resource.prototype.constructor.apply(this,arguments);
	},{
		data: {
			center: {x:0,y:0,z:0},
			mapData: undefined,
		},
		inportData: function(data){
			Resource.prototype.inportData.apply(this,arguments);
			return data;
		},
		exportData: function(){
			var data = Resource.prototype.exportData.apply(this,arguments);
			return data;
		},
		toJSON: function(cb,progress){
			var json = {
				data: this.exportData(),
				chunks: []
			}
			this.mapLoader.exportData(function(data){
				json.chunks = data;
				if(cb) cb(json);
			},progress);
		},
		fromJSON: function(json,cb,progress){
			var json = fn.combindOver({
				data: {},
				chunks: []
			},json);

			this.inportData(json.data);

			this.mapLoader.inportData(json.chunks,cb,progress);
		}
	}).add()
})()