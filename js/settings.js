function SettingsController(table,settings,cb){
	if(!settings || !table) return;

	this.events = new Events();

	this.table = table;
	this.defaults = settings || {};
	this.settings = ko.mapping.fromJS(this.defaults);

	this.sync(cb);
}
SettingsController.prototype = {
	dbName: 'settings',
	sync: function(cb){
		return new Promise(function(resolve, reject){
			var settings = {};
			this.table.each(function(data){
				settings[data.id] = data.data;
			}).then(function(){
				ko.mapping.fromJS(settings,this.settings);
				resolve();
				cb && cb();
			}.bind(this))
		}.bind(this));
	},
	update: function(cb){
		return new Promise(function(resolve, reject){
			var settings = ko.mapping.toJS(this.settings);
			for(var id in settings){
				this.table.put({
					id: id,
					data: settings[id]
				})
			}
			resolve();
			cb && cb();
		}.bind(this));
	},
	settings: {},
	defaults: {},
	events: undefined,
	/*
		synced
		updated
	*/
	get: function(path,obj){
		if(typeof path == 'string') path = path.split('/');
		obj = obj || this.settings;

		if(obj[path[0]]){
			if(path.length > 1){
				return this.get(path,obj[path.shift()]);
			}
			else{
				return obj[path[0]]();
			}
		}
	},
	set: function(path,val,obj){
		if(typeof path == 'string') path = path.split('/');
		obj = obj || this.settings;

		if(obj[path[0]]){
			if(path.length > 1){
				return this.set(path,val,obj[path.shift()]);
			}
			else{
				return obj[path[0]](val);
			}
		}
	},
	resetToDefaults: function(){
		ko.mapping.fromJS(this.defaults,this.settings);
	}
}

function initSettings(cb){
	settings = new SettingsController(settingsDB.settings,{
		graphics: {
			viewRange: 3,
			shadows: true
		}
	},function(){
		console.info('settings loaded');
		cb && cb();
	})
}