//this file handles the scene/update/rendering of the menu
menu = {
	container: undefined,
	enabled: false,
	enable: function(){
		this.modal.maps.selected(-1);
		this.modal.menu('main');
		this.modal.maps.updateMaps();
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
		editor: function(){
			states.enableState('roomEditor');
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
						map.data.name = this.name();
						map.data.desc = this.desc();
						map.save();
						this.name('');
						this.desc('');

						self.updateMaps();
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

					map.toJSON(function(json){
						var str = JSON.stringify(json);
						self.downloadLink('data:text/json,'+str);
						self.downloadName(map.data.name);
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
							
							var map = resources.createResource('map',json.data);
							self.updateMaps();

							//inport chunks
							map.mapLoader.inportData(json.chunks);
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

				resources.createResource('map',{
					name: this.create.name(),
					desc: this.create.desc()
				});
				self.updateMaps();

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

				resources.deleteResource(map.id);
				self.updateMaps();

				this.selected(-1);
				$('#delete-map-modal').modal('hide');
			},
			editMap: function(){
				var self = menu.modal.maps;
				var map = self.maps()[self.selected()];
				self.edit.name(map.data.name);
				self.edit.desc(map.data.desc);
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

			updateMaps: function(cb){
				var self = menu.modal.maps;
				self.maps([]);
				self.maps(resources.modal.map());
				if(cb) cb();
			},
			saveMaps: function(cb){
				resources.saveAllResources('map',db);
			}
		}
	}
}

states.addState('menu',menu);