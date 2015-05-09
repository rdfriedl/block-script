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