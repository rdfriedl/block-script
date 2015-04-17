//this file handles the scene/update/rendering of the game
game = {
	container: undefined,
	enabled: false,
	enable: function(){

	},
	disable: function(){

	},

	scene: undefined,
	camera: undefined,
	sceneHUD: undefined,
	cameraHUD: undefined,
	renderer: undefined,
	lightGroup: undefined,
	player: undefined,
	map: undefined,
	init: function(){
		var width = window.innerWidth;
		var height = window.innerHeight;

		//set up state
		this.container = $('#game');

		this.sceneHUD = new THREE.Scene();
		this.cameraHUD = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10);
		this.cameraHUD.position.z = 10;

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0xbfd1e5,settings.viewRange * settings.chunkSize / 100000);
		this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 20000);

		//renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor( 0xbfd1e5 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( width, height );
	    this.renderer.shadowMapEnabled = true;
	    this.renderer.shadowMapSoft = true;
	    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	    this.renderer.autoClear = false;
		this.container.append(this.renderer.domElement);

		//setup
		this.setUpScene();
		this.setUpHUD();
		this.setUpPointerLock();

		this.map = new Map(this,this.scene,{});
		this.player = new Player(this,this.scene,this.camera);

		var mapLoader = new MapLoaderIndexeddb({
			dbName: 'map'
		});
		var chunkGenerator = new ChunkGeneratorHills({
			width: 40*settings.chunkSize-1,
			height: 40*settings.chunkSize-1,
			levels: [
				{
					height: 1,
					quality: 5,
					blocks: [
						{
							block: 'grass',
							height: 1,
						},
						{
							block: 'dirt',
							height: 1000,
						}
					]
				},
				{
					height: 5,
					quality: 5,
					blocks: [
						{
							block: 'dirt',
							height: 1000,
						}
					]
				},
				{
					height: 2,
					quality: 5,
					blocks: [
						{
							block: 'air',
							height: 1000,
						}
					]
				},
				{
					height: 5,
					quality: 5,
					blocks: [
						{
							block: 'stone',
							height: 1000,
						}
					]
				},
			]
		})

		this.map.setMapLoader(mapLoader);
		this.map.setChunkGenerator(chunkGenerator);

		// set player position
		this.player.position.x = (this.map.chunkGenerator.options.width*settings.blockSize) / 2;
		this.player.position.z = (this.map.chunkGenerator.options.height*settings.blockSize) / 2;
		var y = this.map.chunkGenerator.getY(
				Math.floor(this.player.position.x/settings.blockSize),
				Math.floor(this.player.position.z/settings.blockSize)
			);
		this.player.position.y = (Math.max(y[0],y[1],y[2],y[3]) + 4) * settings.blockSize;

		this.loadChunkLoop();
		this.saveChunkLoop();
		this.unloadChunkLoop();
		
		$(window).resize(function(event) {
			var width = window.innerWidth;
			var height = window.innerHeight;

			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();

			this.cameraHUD.left = - width / 2;
			this.cameraHUD.right = width / 2;
			this.cameraHUD.top = height / 2;
			this.cameraHUD.bottom = - height / 2;
			this.cameraHUD.updateProjectionMatrix();

			this.renderer.setSize(width,height );
		}.bind(this));
	},
	setUpScene: function(){
		//light
		this.lightGroup = new THREE.Group();
		this.scene.add(this.lightGroup);

		var ambient = new THREE.AmbientLight( 0x888888 );
	    this.lightGroup.add(ambient);

	    var shadowNear = 1200;
	    var shadowFar = 15000;

		sun = new THREE.DirectionalLight( 0xffffff, 1 );
		sun.position.set( 0, 1, 0 );
	    sun.position.multiplyScalar(5000);

	    // sun.castShadow = true;
	    // sun.onlyShadow = true;

	    sun.shadowCameraNear = shadowNear;
	    sun.shadowCameraFar = shadowFar;

	    sun.shadowBias = 0.0001;
	    sun.shadowMapDarkness = 0.8;
	    sun.shadowMapWidth = 1280;
	    sun.shadowMapHeight = 1280;

	    var size = 1500;
	    sun.shadowCameraLeft = -size;
	    sun.shadowCameraRight = size;
	    sun.shadowCameraTop = size;
	    sun.shadowCameraBottom = -size;

	    // sun.shadowCameraVisible = true;

	    this.lightGroup.add(sun);
	    this.lightGroup.add(sun.target);

	    this.lightGroup.rotateX(THREE.Math.degToRad(20));
	    this.lightGroup.rotateZ(THREE.Math.degToRad(40));

		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		this.container.append(this.stats.domElement);
	},
	setUpHUD: function(){
		//add pointer
		var map = THREE.ImageUtils.loadTexture("res/img/pointer.png");
        map.magFilter = THREE.NearestFilter;
        map.minFilter = THREE.LinearMipMapLinearFilter;
	    var material = new THREE.SpriteMaterial({ map: map, color: 0xffffff, fog: false });
	    var sprite = new THREE.Sprite(material);
	    sprite.scale.set(30,30,30);
	    this.sceneHUD.add(sprite);
	},
	setUpPointerLock: function(){
		// Hook pointer lock state change events
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', this.pointerlockchange.bind(this));

		$('#pointer-lock').click(function(event){
			$('#pointer-lock').hide();

			// Ask the browser to lock the pointer
			document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

			if(/Firefox/i.test(navigator.userAgent)) {
				var fullscreenchange = function(event) {
					if ( document.fullscreenElement === document.body || document.mozFullscreenElement === document.body || document.mozFullScreenElement === document.body ) {

						document.removeEventListener('fullscreenchange', fullscreenchange);
						document.removeEventListener('mozfullscreenchange', fullscreenchange);

						document.body.requestPointerLock();
					}
				}

				document.addEventListener('fullscreenchange', fullscreenchange, false);
				document.addEventListener('mozfullscreenchange', fullscreenchange, false);

				document.body.requestFullscreen = document.body.requestFullscreen || document.body.mozRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen;

				document.body.requestFullscreen();
			} 
			else {
				document.body.requestPointerLock();
			}
		});
	},
	update: function(){
		this.animate();
		this.render();
	},
	animate: function(){
		this.stats.update();

		this.player.update();

		this.lightGroup.position.copy(this.player.position);
	},
	render: function(){
		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render(this.sceneHUD, this.cameraHUD);
	},

	pointerlockchange: function (event) {
		if ( document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body ) {
			this.player.enabled = true;

			$('#pointer-lock').hide();
		} 
		else {
			this.player.enabled = false;

			$('#pointer-lock').css('display','-webkit-box');
			$('#pointer-lock').css('display','-moz-box');
			$('#pointer-lock').css('display','box');
		}
	},
	loadChunkLoop: function(){
		var depth = 2;
		if(this.enabled){
			var func = function(x,z,dist,cb){
				var loaded = true;
				for (var y = -depth; y <= depth; y++) {
					var position = this.player.position.clone();
					position.x = Math.floor(position.x / (settings.chunkSize*settings.blockSize)) + x;
					position.y = Math.floor(position.y / (settings.chunkSize*settings.blockSize)) + y;
					position.z = Math.floor(position.z / (settings.chunkSize*settings.blockSize)) + z;
					loaded = (!loaded)? loaded : this.map.chunkLoaded(position);
				};
				loaded = !!loaded;

				if(!loaded){
					// cb = _.after(depth*2+1,cb);
					//load
					for (var y = -depth; y <= depth; y++) {
						var position = this.player.position.clone();
						position.x = Math.floor(position.x / (settings.chunkSize*settings.blockSize)) + x;
						position.y = Math.floor(position.y / (settings.chunkSize*settings.blockSize)) + y;
						position.z = Math.floor(position.z / (settings.chunkSize*settings.blockSize)) + z;
						
						this.map.getChunk(position);
					};
					cb();
				}
				else{
					if(++x > dist){
						x = -dist;
						z++;
					}
					if(z > dist){
						z = -dist;
						dist += 1;
					}
					if(dist > settings.viewRange){
						cb();
						return;
					}

					func.bind(this)(x,z,dist,cb);
				}
			}
			func.bind(this)(0,0,0,function(){
				setTimeout(this.loadChunkLoop.bind(this),50);
			}.bind(this));
		}
		else{
			setTimeout(this.loadChunkLoop.bind(this),50);
		}
	},
	saveChunkLoop: function(i){
		i = i || 0;

		var func = function(){
			var k = 0;
			for(var chunk in this.map.chunks){
				k++;
			}
			if(++i >= k){
				i=0;
			}
			setTimeout(this.saveChunkLoop.bind(this,i),10);
		}.bind(this);

		if(this.enabled){
			var k=0;
			for(var chunk in this.map.chunks){
				if(k==i){
					this.map.saveChunk(this.map.chunks[chunk].position,func);
					break;
				}
				k++;
			}

			if(k==0) func();
		}
		else{
			func();
		}
	},
	unloadChunkLoop: function(){
		var position = this.player.position.clone();

		if(this.enabled){
			position.x = Math.floor(position.x / (settings.chunkSize*settings.blockSize));
			position.y = Math.floor(position.y / (settings.chunkSize*settings.blockSize));
			position.z = Math.floor(position.z / (settings.chunkSize*settings.blockSize));

			for (var i in this.map.chunks) {
				var chunk = this.map.chunks[i]
				if(chunk.mesh){
					if(Math.abs(this.map.chunks[i].position.x - position.x) > settings.viewRange || Math.abs(this.map.chunks[i].position.y - position.y) > settings.viewRange || Math.abs(this.map.chunks[i].position.z - position.z) > settings.viewRange){
						chunk.unload();
					}
				}
			};
		}

		setTimeout(this.unloadChunkLoop.bind(this),500);
	},

	modal: {
		menu: 'none'
	}
}

states.addState('game',game);