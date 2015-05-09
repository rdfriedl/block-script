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
			for (var i = 0; i < _resources.length; i++) {
				_resources[i]._parent = _resources[i].parent;
				this.addResource(_resources[i],true);
			};

			//attach all the parents
			for (var i = 0; i < _resources.length; i++) {
				if(_resources[i]._parent){
					_resources[i].addTo(_resources[i]._parent,true);
				}
				delete _resources[i]._parent;

				_resources[i].events.emit('load');
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
	saveResource: function(r,cb){
		if(typeof r == 'string'){
			r = this.getResource(r,true);
		}
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
	deleteResource: function(r,cb){
		if(typeof r == 'string'){
			r = this.getResource(r,true);
		}
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
	findResource: function(data,children){
		for (var i in this.resources) {
			for (var k in this.resources[i].data) {
				if(this.resources[i].data[k] == data[k]){
					return this.resources[i];
				}
			};
			
			if(children){
				var r = this.resources[i].findResource(data,children)
				if(r) return r;
			}
		};
	},
	addResource: function(resource,dontSave){
		if(!resource instanceof Resource) return this;
		resource.remove(dontSave);
		this.resources.push(resource);
		resource.parent = this;
		resource.events.emit('add',this);
		if(!dontSave) resource.save();
		this.modal.update();
		return this;
	},
	removeResource: function(r,dontSave){
		if(typeof r == 'string'){
			r = this.getResource(r,true);
		}
		if(r){
			r.parent = undefined;
			this.resources.splice(this.resources.indexOf(r),1);
			r.events.emit('remove');
			if(!dontSave) r.save();

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

	createResource: function(type,data,parent){
		var r = resources.getResourceType(type);
		if(r){
			var resource = new r(undefined,data,parent);
			this.addResource(resource);
			return resource;
		}
	},
	defineResource: function(type,data,parent){
		var r = this.findResource(data,true);
		if(r){
			//maybe inport data here?
			return r;
		}
		else{
			return this.createResource(type,data,parent);
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
		createDate: undefined,
		name: ''
	},
	children: [],

	inportData: function(data){
		data = data || {};
		fn.combindOver(this.data,data);
		if(data.createDate) this.data.createDate = new Date(data.createDate);
	},
	exportData: function(){
		var data = fn.duplicate(this.data);
		data.createDate = this.data.createDate.toDateString();
		return data;
	},
	getParent: function(){
		if(this.parent){
			return this.parent;
		}
	},
	dispose: function(cb){
		if(cb) cb();
	},

	getResource: function(id,children){
		for (var i in this.children) {
			if(this.children[i].id == id){
				return this.children[i];
			}
			else if(children){
				var r = this.children[i].getResource(id,children)
				if(r) return r;
			}
		};
	},
	findResource: function(data,children){
		for (var i in this.children) {
			for (var k in this.children[i].data) {
				if(this.children[i].data[k] == data[k]){
					return this.children[i];
				}
			};
			
			if(children){
				var r = this.children[i].findResource(data,children)
				if(r) return r;
			}
		};
	},
	addResource: function(resource,dontSave){
		if(!resource instanceof Resource) return this;
		resource.remove(dontSave);
		this.children.push(resource);
		resource.parent = this;
		resource.events.emit('add',this);
		if(!dontSave) resource.save();
		return this;
	},
	removeResource: function(r,dontSave){
		if(typeof r == 'string'){
			r = this.getResource(r,true)
		}

		if(r){
			r.parent = undefined;
			this.children.splice(this.children.indexOf(f),1);
			r.events.emit('remove');
			if(!dontSave) r.save();
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

	createResource: function(type,data,parent){
		var r = resources.getResourceType(type);
		if(r){
			var resource = new r(undefined,data,parent);
			this.addResource(resource);
			return resource;
		}
	},
	defineResource: function(type,data,parent){
		var r = this.findResource(data,true);
		if(r){
			//maybe inport data here?
			return r;
		}
		else{
			return this.createResource(type,data,parent);
		}
	},

	addTo: function(parent,dontSave){
		if(typeof parent == 'string'){
			parent = resources.getResource(parent,true)
		}
		if(parent){
			parent.addResource(this,dontSave);
		}
	},

	remove: function(dontSave){
		if(this.parent instanceof Resource || this.parent === resources){
			this.parent.removeResource(this,dontSave);
		}
	},

	save: function(cb){
		resources.saveResource(this,cb);
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