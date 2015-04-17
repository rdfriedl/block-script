MapLoaderIndexeddb = function(options,cb){
	this.booting = true;

	this.options = fn.combindOver({
		dbName: 'map-'+Math.round(Math.random()*1000),
	},options);

	this.db = new Dexie(this.options.dbName);
	this.db.version(this.dbVersion)
		.stores({
			map: '',
			chunks: 'id,position,data'
		});

	this.db.open().then(function(){
		this.booting = false;
		if(cb) cb();
	}.bind(this));

	this.db.on('error',function(err){
		console.log(err);
	});
}
MapLoaderIndexeddb.prototype = {
	dbVersion: 1,
	booting: false,
	db: undefined,
	options: {},
	loadChunk: function(position,cb){
		//if we are booting bind an evnet listener
		// this.db.chunks.where('id').equals(position.x+'|'+position.y+'|'+position.z).first(function(data){
		// 	console.log(data);
		// 	if(cb) cb(data);
		// })
		this.db.chunks.get(position.toString(),function(data){
			if(data){
				data = data.data;
			}
			if(cb) cb(data);
		})
	},
	saveChunk: function(chunk,cb){
		this.db.chunks.put({
			id: chunk.position.toString(),
			data: chunk.exportData()
		})
		if(cb) cb();
	}
};