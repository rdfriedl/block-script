//this file handles the scene/update/rendering of the menu
menu = {
	container: undefined,
	enabled: false,
	enable: function(){
		this.modal.maps.selected(-1);
		this.modal.menu('main');
		this.modal.maps.updateMaps();
		
		renderer.setClearColor(0x2b3e50, 1);
	},
	disable: function(){

	},

	events: new Events(),
	scene: undefined,
	camera: undefined,
	mouse: {
		x: 0,
		y: 0
	},
	init: function(cb){
		//set up state
		this.container = $('#menu');

		this.container.mousemove(function(event) {
			this.mouse.x = ( event.clientX - window.innerWidth/2 );
			this.mouse.y = ( event.clientY - window.innerHeight/2 );
		}.bind(this));

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1800;

		this.voxelMap = new VoxelMap(this,this.scene,{});

		this.setUpScene();

		$(window).resize(function(event) {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		}.bind(this));
	},
	setUpScene: function(){
		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );
		this.scene.add( light );
		
		var ambient = new THREE.AmbientLight( 0x666666 );
	    this.scene.add(ambient);

		$.ajax({
			url: 'data/menuScene.json',
			type: 'GET',
			dataType: 'json'
		})
		.done(function(data){
			data.size = new THREE.Vector3().copy(data.size);
			data.offset = new THREE.Vector3().copy(data.offset);
			this.voxelMap.inportMapData(data);
		}.bind(this))
	},
	update: function(dtime){
		this.animate(dtime);
		this.render(dtime);
	},
	animate: function(dtime){
		this.camera.position.x += ( this.mouse.x - this.camera.position.x ) * 0.05;
		this.camera.position.y += ( - this.mouse.y - this.camera.position.y ) * 0.05;
		this.camera.lookAt( this.scene.position );
	},
	render: function(dtime){
		renderer.clear();
		renderer.render(this.scene, this.camera);
	},
	buildModal: function(){
		var that = this;
		return {
			menu: 'main',
			settings: {
				graphics: {
					viewRangeRange: [2,8],
					viewRange: observable(settings._get('graphics/viewRange'),function(val){
						settings._set('graphics/viewRange',parseInt(val));
					}),
					shadows: observable(settings._get('graphics/shadows'),function(val){
						settings._set('graphics/shadows',val);
					})
				},
				save: function(){
					settings._update().then(function(){
						that.modal.menu('main')
					})
				}
			},
			maps: {
				maps: [],
				selected: -1,
				create: {
					name: '',
					desc: '',
					submit: function(){
						menu.modal.maps.createMap(this);
						this.name('');
						this.desc('');
					}
				},
				edit: {
					name: '',
					desc: '',
					submit: function(){
						var self = menu.modal.maps;
						var map = self.maps()[self.selected()];
						if(map){
							map.loader.setSettings({
								info: {
									name: this.name(),
									desc: this.desc()
								}
							}).then(self.updateMaps)
							this.name('');
							this.desc('');
						}
						$('#edit-map-modal').modal('hide');
					}
				},
				download: {
					progress: 0,
					downloadLink: '',
					downloadName: '',
					download: function(map){
						var self = menu.modal.maps.download;

						map.loader.toJSON(function(json){
							var str = JSON.stringify(json);
							self.downloadLink('data:text/json,'+str);
							self.downloadName(map.loader.settings.info.name);
						},function(val){
							self.progress(val);
						});
					}
				},
				upload: {
					progress: 0,
					upload: function(self,event){
						var self = menu.modal.maps;
						event.preventDefault();
						readfiles(event.target.files,function(json){
							try{
								json = JSON.parse(json);
								
								var id = THREE.Math.generateUUID()
								var map = {
									id: id,
									type: 'indexedDB',
									data: 'block-script-map:'+id
								}
								var mapLoader = new MapLoaderDB(map.data);

								//inport chunks
								Promise.all([
									mapLoader.fromJSON(json),
									settingsDB.maps.add(map)
								]).then(function(){
									self.maps.push({
										map: map,
										loader: mapLoader
									})
								})
							}
							catch(e){
								console.error('failed to upload map')
								console.error(e);
							}

							$('#upload-map-modal').modal('hide');
						})
						event.target.value = null;
					}
				},
				createMap: function(data){
					var self = menu.modal.maps;
					var id = THREE.Math.generateUUID()
					var map = {
						id: id,
						type: 'indexedDB',
						data: 'block-script-map:'+id
					}
					var mapLoader = new MapLoaderDB(map.data);
					mapLoader.setSettings({
						info: {
							name: this.create.name(),
							desc: this.create.desc(),
							created: new Date(),
							saved: new Date()
						}
					}).then(function(){
						self.maps.push({
							map: map,
							loader: mapLoader
						});
					});
					settingsDB.maps.add(map);

					$('#new-map-modal').modal('hide');
				},
				playMap: function(index){
					var self = menu.modal.maps;
					var map = self.maps()[self.selected()];

					if(index !== undefined) map = self.maps()[index];

					states.enableState('game');
					game.requestPointerLock();
					game.loadMap(map.loader);
				},
				deleteMap: function(index){
					var self = menu.modal.maps;
					var map = self.maps()[self.selected()];
					if(_.isNumber(index)) map = self.maps()[index];

					Promise.all([
						settingsDB.maps.delete(map.map.id),
						map.loader.delete()
					]).then(function(){
						self.maps.splice(self.maps.indexOf(map),1);

						this.selected(-1);
						$('#delete-map-modal').modal('hide');
					}.bind(this)).catch(catchError('failed to delete map'))
				},
				editMap: function(){
					var self = menu.modal.maps;
					var map = self.maps()[self.selected()];
					self.edit.name(map.loader.settings.info.name);
					self.edit.desc(map.loader.settings.info.desc);
					$('#edit-map-modal').modal('show');
				},
				downloadMap: function(){
					var self = menu.modal.maps;
					var map = self.maps()[this.selected()];
					self.download.download(map);
					$('#download-map-modal').modal('show');
				},
				uploadMap: function(){
					$('#upload-map-modal').modal('show');
				},

				getMap: function(id){
					for(var i in menu.modal.maps.maps()){
						if(menu.modal.maps.maps()[i].map.id == id){
							return menu.modal.maps.maps()[i];
						}
					}
				},
				updateMaps: function(cb){
					var self = menu.modal.maps;
					var maps = [];
					return new Promise(function(resolve,reject){
						var done = function(){
							//update maps array
							self.maps([]);
							self.maps(maps);

							//callback
							resolve();
							if(cb) cb();
						};

						return settingsDB.maps.count(function(count){
							done = _.after(count+1,done);
						}).then(function(){
							done();
							
							return settingsDB.maps.each(function(data){
								var map = self.getMap(data.id);
								if(map){
									//update it
									maps.push(map);
									map.loader.loadSettings().then(done);
								}
								else{
									var mapLoader = new MapLoaderDB(data.data);
									maps.push({
										map: data,
										loader: mapLoader
									});
									mapLoader.events.once('init',done);
								}
							})
						})
					})
				}
			}
		}
	}
}

states.addState('menu',menu);