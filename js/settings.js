function SettingsController(table,settings,cb){
	if(!settings || !table) return;

	this.table = table;
	this._defaults = settings || {};
	fn.combindOver(this,this._defaults);

	this._events = new Events();

	this._sync(cb);
}
SettingsController.prototype = {
	_sync: function(cb){
		return new Promise(function(resolve, reject){
			this.table.each(function(data){
				if(data.id in this._defaults){
					this[data.id] = data.data;
				}
			}.bind(this)).then(function(){
				this._events.emit('synced');
				if(cb) cb();
				resolve();
			}.bind(this));
		}.bind(this));
	},
	_update: function(cb){
		return new Promise(function(resolve, reject){
			for(var id in this._defaults){
				this.table.put({
					id: id,
					data: this[id]
				});
			}
			this._events.emit('updated');
			if(cb) cb();
			resolve();
		}.bind(this));
	},
	_defaults: {},
	_events: undefined,
	/*
		synced
		updated
	*/
	_get: function(path,obj){
		if(typeof path == 'string') path = path.split('/');
		obj = obj || this;

		if(obj[path[0]] != null){
			if(path.length > 1){
				return this._get(path,obj[path.shift()]);
			}
			else{
				return obj[path[0]];
			}
		}
	},
	_set: function(path,val,obj){
		if(typeof path == 'string') path = path.split('/');
		obj = obj || this;

		if(obj[path[0]] != null){
			if(path.length > 1){
				return this._set(path,val,obj[path.shift()]);
			}
			else{
				obj[path[0]] = val;
				return obj[path[0]];
			}
		}
	},
	_resetToDefaults: function(){
		fn.combindOver(this,this._defaults);
	}
};

function initSettings(cb){
	return new Promise(function(resolve,reject){
		settings = new SettingsController(settingsDB.settings,{
			graphics: {
				viewRange: 3,
				shadows: true
			}
		});

		settings._events.once('synced',function(){
			if(cb) cb(settings);
			resolve(settings);
		});
	});
}
