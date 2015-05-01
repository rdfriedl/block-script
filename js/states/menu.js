//this file handles the scene/update/rendering of the menu
menu = {
	container: undefined,
	enabled: false,
	enable: function(){
		this.modal.maps.selected(-1);
		this.modal.menu('main');
	},
	disable: function(){

	},

	events: new Events(),
	scene: undefined,
	camera: undefined,
	map: undefined,
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

		this.events.once('loaded',function(){
			this.modal.maps.loadMaps();
		}.bind(this))
	},
	setUpScene: function(){
		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

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
	render: function(dtime,rtt){
		renderer.setClearColor(0x2b3e50, 1);

		renderer.clear();
		renderer.render(this.scene, this.camera);
	},
	modal: {
		menu: 'main',
		settings: {
			graphics: {
				viewRangeRange: [2,8],
				viewRange: 3,
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
						map.settings.info.name = this.name();
						map.settings.info.desc = this.desc();
						map.saveSettings();
						this.name('');
						this.desc('');

						//update map list
						var a = self.maps();
						self.maps([]);
						self.maps(a);

						self.saveMaps();
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

					map.exportData(function(json){
						json.settings = map.settings;

						var str = JSON.stringify(json);
						self.downloadLink('data:text/json,'+str);
						self.downloadName(map.settings.info.name);
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
					readfiles(event.target.files,function(data){
						try{
							data = JSON.parse(data);

							var id = Math.round(Math.random() * 1000000);
							var dbName = 'block-script-map:' + id;

							//create map db and put data in
							var map = new MapLoader({
								dbName: dbName
							})
							map.inportData(data);
							map.settings.info.id = id;
							map.settings.info.dbName = dbName;
							map.saveSettings();

							self.maps.push(map);

							self.saveMaps();
						}
						catch(e){
							console.log('failed to upload map')
							console.log(e);
						}

						$('#upload-map-modal').modal('hide');
					})
					event.target.value = null;
				}
			},
			createMap: function(data){
				var id = Math.round(Math.random() * 1000000);
				var dbName = 'block-script-map:' + id;

				//add it to the array of maps
				this.maps.push(new MapLoader({
					id: id,
					dbName: dbName,
					name: this.create.name(),
					desc: this.create.desc()
				}));

				this.saveMaps();

				$('#new-map-modal').modal('hide');
			},
			playMap: function(index){
				var self = menu.modal.maps;
				var map = self.maps()[self.selected()];

				if(index !== undefined) map = self.maps()[index];

				states.enableState('game');
				game.requestPointerLock();
				game.loadMap(map);
			},
			deleteMap: function(index){
				var self = menu.modal.maps;
				var map = self.maps()[self.selected()];
				if(_.isNumber(index)) map = self.maps()[index];

				settingsDB.maps.delete(map.settings.info.id);
				map.db.delete();
				this.maps.splice(this.selected(),1);

				this.selected(-1);
				$('#delete-map-modal').modal('hide');
			},
			editMap: function(){
				var self = menu.modal.maps;
				var map = self.maps()[self.selected()];
				self.edit.name(map.settings.info.name);
				self.edit.desc(map.settings.info.desc);
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

			loadMaps: function(cb){
				var self = menu.modal.maps;
				settingsDB.maps.toArray(function(a){
					self.maps([]);
					var maps = [];
					cb = _.after(a.length+1, cb || function(){});
					for(var i = 0; i < a.length; i++){
						var mapLoader = new MapLoader({
							dbName: a[i].dbName
						});

						mapLoader.events.on('loadSettings',function(){
							self.maps.push(this);
							cb();
						}.bind(mapLoader))
					}
					cb();
				});
			},
			saveMaps: function(cb){
				var length = 0;
				for(var i in this.maps()){
					length++;
				}
				cb = _.after(length+1, cb || function(){});
				for(var i in this.maps()){
					settingsDB.maps.put({
						id: this.maps()[i].settings.info.id,
						dbName: this.maps()[i].settings.info.dbName
					}).finally(cb);
				}
				cb();
			}
		}
	}
}

states.addState('menu',menu);