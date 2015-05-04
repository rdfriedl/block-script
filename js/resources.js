//the point of this class is to have all the resources map/blocks/rooms/templates/scripts go through one controler
resources = {
	resourceTypes: {},
	resources: {},

	init: function(cb){
		this.loadResources(function(){
			this.modal.update()
			if(cb) cb();
		}.bind(this))
	},

	getResourceType: function(type){
		return this.resourceTypes[type];
	},
	addResourceType: function(resource,type,dbID){
		if(this.getResourceType(type)){
			console.error('resource type with type: '+type+' already exists');
			return;
		}
		this.resourceTypes[type] = {
			resource: resource,
			type: type,
			dbID: dbID
		}
		this.resources[type] = [];
	},
	extend: function(init,proto,extend){
		extend = extend || Resource;
		init = init || function(){};

		init.prototype = proto
		init.prototype.__proto__ = extend.prototype;
		init.prototype.constructor = init;

		return init;
	},

	loadResources: function(cb){
		var l = 0;
		for (var i in this.resourceTypes) {
			l++;
		};
		cb = _.after(l+1,cb || function(){});
		for (var i in this.resourceTypes) {
			var resource = this.getResourceType(i);

			if(settingsDB[resource.dbID]){
				settingsDB[resource.dbID].toArray(function(resource,a){
					//remove all this type of resources
					this.removeAllResources(resource.type,function(){
						//add all the resources
						for (var j = 0; j < a.length; j++) {
							this.addResource(new resource.resource(a[j].id,a[j].data));
						};
						cb();
					}.bind(this))
				}.bind(this,resource))
			}
			else if(cb) cb();
		};
		cb();
	},
	addResource: function(resource){
		if(!this.resources[resource.type]) this.resources[resource.type] = [];
		this.resources[resource.type].push(resource);
		return resource;
	},
	createResource: function(type,data){
		if(this.getResourceType(type)){
			var r = this.getResourceType(type).resource;
			var resource = new r(undefined,data);
			this.addResource(resource);
			this.saveResource(resource.id,resource.type);
			return resource;
		}
	},
	getResource: function(id,type){
		if(this.getResourceType(type)){
			for (var i = 0; i < this.resources[type].length; i++) {
				if(this.resources[type][i].id == id){
					return this.resources[type][i];
				}
			};
		}
	},
	saveResource: function(id,type,cb){
		var r = this.getResource(id,type);
		if(r){
			//save it
			settingsDB[r.__proto__.constructor.dbID].put({
				id: r.id,
				data: r.exportData()
			});

			if(cb) cb();
		}
	},
	saveAllResources: function(type,cb){
		if(this.getResourceType(type)){
			cb = _.after(this.resources[type].length+1,cb || function(){});
			for (var i = 0; i < this.resources[type].length; i++) {
				this.resources[type][i].save(cb);
			};
			cb();
		}
	},
	removeResource: function(id,type,cb){
		var r = this.getResource(id,type);
		if(r){
			r.dispose(function(){
				//remove from db
				settingsDB[r.__proto__.constructor.dbID].delete(r.id);

				//remove from array
				this.resources[type].splice(this.resources[type].indexOf(r),1);
				this.modal.update();

				if(cb) cb();
			}.bind(this))
		}
	},
	removeAllResources: function(type,cb){
		if(this.getResourceType(type)){
			cb = _.after(this.resources[type].length+1,cb || function(){});
			for (var i = 0; i < this.resources[type].length; i++) {
				this.resources[type][i].remove(cb);
			};
			cb();
		}
	},

	modal: {
		update: function(){
			var self = resources;
			for (var i in self.resourceTypes) {
				if(!this[self.resourceTypes[i].dbID]) this[self.resourceTypes[i].dbID] = ko.observableArray([]);
				this[self.resourceTypes[i].dbID](self.resources[self.resourceTypes[i].type]);
			};
		}
	}
}

function Resource(id,data){
	this.data = fn.duplicate(this.data);
	this.id = id || THREE.Math.generateUUID();
	this.events = new Events();

	this.data.createDate = new Date();
	this.inportData(data);
}
Resource.prototype = {
	events: undefined,
	id: 0,
	data: {
		createDate: undefined
	},

	inportData: function(data){
		fn.combindOver(this.data,data);
		if(data.createDate) this.data.createDate = new Date(data.createDate);
	},
	exportData: function(){
		var data = fn.duplicate(this.data);
		data.createDate = this.data.createDate.toDateString();
		return data;
	},
	dispose: function(cb){
		if(cb) cb();
	},

	save: function(cb){
		resources.saveResource(this.id,this.type,cb);
	},
	remove: function(cb){
		resources.removeResource(this.id,this.type,cb);
	}
}
Resource.prototype.constructor = Resource;
Object.defineProperties(Resource.prototype,{
	type: {
		get: function(){
			return this.constructor.name.toLowerCase();
		}
	}
})

Resource.extend = function(init,proto){
	init.prototype = proto || init.prototype;
	init.prototype.__proto__ = this.prototype;
	init.prototype.constructor = init;

	init.extend = this.extend;
	init.add = this.add;

	init.type = init.name.toLowerCase();

	return init;
}
Resource.add = function(dbID){
	this.dbID = dbID;
	resources.addResourceType(this,this.type,dbID);
	return this;
}