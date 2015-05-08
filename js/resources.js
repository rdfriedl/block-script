//the point of this class is to have all the resources map/blocks/rooms/templates/scripts go through one controler
resources = {
	resourceTypes: {},
	resources: [],

	init: function(cb){
		this.loadResources(function(){
			this.modal.update()
			if(cb) cb();
		}.bind(this))
	},

	getResourceType: function(type){
		return this.resourceTypes[type];
	},
	addResourceType: function(resource){
		if(!resource instanceof Resource) return;
		if(this.getResourceType(resource.type)){
			console.error('resource type with type: '+resource.type+' already exists');
			return;
		}
		this.resourceTypes[resource.type] = resource;
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
		var l = 0, _resources = [];
		for (var i in this.resourceTypes) {
			l++;
		};
		var done = _.after(l+1,function(){
			this.resources = _resources;
			//attach all the parents
			for (var i = 0; i < _resources.length; i++) {
				var r = _resources[i]
				var p = r.parent;
				r.parent = this;

				if(p){
					r.addTo(p);
				}

				r.events.emit('load');
			};

			if(cb) cb();
		}.bind(this));

		//remove all this type of resources
		this.removeAllResources(function(){
			for (var i in this.resourceTypes) {
				var type = this.getResourceType(i);

				if(settingsDB[type.type]){
					settingsDB[type.type].toArray(function(type,a){
						//add all the resources
						for (var j = 0; j < a.length; j++) {
							var resource = new type(a[j].id,a[j].data)

							_resources.push(resource);
							resource.parent = a[j].parent;
						};
						done();
					}.bind(this,type))
				}
				else done();
			};
		}.bind(this))

		done();
	},
	saveResource: function(id,cb){
		var r = this.getResource(id);
		if(r){
			//save it
			settingsDB[r.type].put({
				id: r.id,
				parent: (r.parent)? r.parent.id : undefined,
				data: r.exportData()
			}).finally(function(){
				if(cb) cb();
			});

			r.events.emit('save');
		}
	},
	saveAllResources: function(cb){
		var length = this.resources.length + 1;

		cb = _.after(length,cb || function(){});
		for (var i in this.resources) {
			this.resources[i].save(cb);
		}
		cb();
	},
	deleteResource: function(id,cb){
		var r = this.getResource(id);
		if(r){
			r.dispose(function(){
				//delete from db
				settingsDB[r.type].delete(r.id);

				//remove from array
				r.remove();

				r.events.emit('delete');

				this.modal.update();

				if(cb) cb();
			}.bind(this))
		}
	},
	deleteAllResources: function(cb){
		var length = this.resources.length + 1;

		cb = _.after(length,cb || function(){});
		for (var i in this.resources) {
			this.resources[i].delete(cb);
		}
		cb();
	},

	getResource: function(id,children){
		for (var i in this.resources) {
			if(this.resources[i].id == id){
				return this.resources[i];
			}
			else if(children){
				var r = this.resources[i].getResource(id,children)
				if(r) return r;
			}
		};
	},
	addResource: function(resource){
		if(!resource instanceof Resource) return this;
		resource.remove();
		this.resources.push(resource);
		resource.parent = this;
		resource.events.emit('add',this);
		this.modal.update();
		return this;
	},
	removeResource: function(id){
		if(id instanceof Resource) id = id.id;

		var r = this.getResource(id);
		if(r){
			r.parent = undefined;
			this.resources.splice(this.resources.indexOf(r),1);
			r.events.emit('remove');

			this.modal.update();
		}
	},
	removeAllResources: function(cb){
		var length = this.resources.length + 1;

		cb = _.after(length,cb || function(){});
		for (var i in this.resources) {
			this.resources[i].remove(cb);
		}
		cb();
	},

	createResource: function(type,data){
		var r = this.getResourceType(type);
		if(r){
			var resource = new r(undefined,data);
			this.addResource(resource);
			this.saveResource(resource.id);
			return resource;
		}
	},

	modal: {
		update: function(){
			var self = resources;
			//clear arrays
			for (var i in self.resourceTypes) {
				var r = self.resourceTypes[i];
				if(!this[r.type]) this[r.type] = ko.observableArray([]);
				this[r.type]([]);
			};
			//build arrays
			for (var i in self.resources) {
				var r = self.resources[i];

				this[r.type].push(r);
			};
		}
	}
}

function Resource(id,data,parent){
	this.data = fn.duplicate(this.data);
	this.id = id || THREE.Math.generateUUID();
	this.events = new Events();

	this.data.createDate = new Date();
	this.inportData(data);

	this.addTo(parent);

	this.children = [];
}
Resource.prototype = {
	events: undefined,
	/*
	remove: fired when this resource if removed from its parent
	add: fired when this resource if added to another resource
	save: 
	load:
	delete:
	*/
	id: 0,
	parent: undefined,
	data: {
		createDate: undefined
	},
	children: [],

	inportData: function(data){
		fn.combindOver(this.data,data);
		if(data.createDate) this.data.createDate = new Date(data.createDate);
	},
	exportData: function(){
		var data = fn.duplicate(this.data);
		data.createDate = this.data.createDate.toDateString();
		return data;
	},
	getParent: function(){
		if(this.parent !== ''){
			return resources.getResource(this.parent);
		}
	},
	dispose: function(cb){
		if(cb) cb();
	},

	getResource: function(id,children){
		for (var i in this.resources) {
			if(this.resources[i].id == id){
				return this.resources[i];
			}
			else if(children){
				var r = this.resources[i].getResource(id,children)
				if(r) return r;
			}
		};
	},
	addResource: function(resource){
		if(!resource instanceof Resource) return this;
		resource.remove();
		this.children.push(resource);
		resource.parent = this;
		resource.events.emit('add',this);
		return this;
	},
	removeResource: function(id){
		if(id instanceof Resource) id = id.id;

		var r = this.getResource(id);
		if(r){
			r.parent = undefined;
			this.children.splice(this.children.indexOf(f),1);
			r.events.emit('remove');
		}
	},
	removeAllResources: function(cb){
		var length = this.children.length + 1;

		cb = _.after(length,cb || function(){});
		for (var i in this.children) {
			this.children[i].remove(cb);
		}
		cb();
	},

	addTo: function(id){
		if(id instanceof Resource) id = id.id;

		var parent = resources.getResource(id,true);
		if(parent instanceof Resource){
			parent.addResource(this);
		}
	},

	remove: function(cb){
		if(this.parent){
			this.parent.removeResource(this);
		}
	},

	save: function(cb){
		resources.saveResource(this.id,cb);
	},
	delete: function(cb){
		resources.deleteResource(this.id,cb);
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
Resource.add = function(){
	resources.addResourceType(this);
	return this;
}