//this file handles the scene/update/rendering of the game
game = {
	container: undefined,
	enabled: false,
	enable: function(){
		keyboard.enableState('game');
		this.modal.blocks.update();
		
		this.chunkLoader.enabled = true;
		this.chunkLoader.setRange(this.viewRange);

		//set renderer options
		renderer.shadowMapEnabled = true;
	    renderer.shadowMapSoft = true;
	    renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;
	},
	disable: function(){
		keyboard.disableState('game');
		this.modal.menu('none');
		this.chunkLoader.enabled = false;

		if(this.loadedMap){
			this.loadedMap.save();
			this.voxelMap.removeAllChunks();
		}
	},

	events: new Events(),
	scene: undefined,
	camera: undefined,
	sceneHUD: undefined,
	cameraHUD: undefined,
	lightGroup: undefined,
	player: undefined,
	voxelMap: undefined,
	chunkSize: 10,
	blockSize: 32,
	loadedMap: undefined,
	chunkLoader: undefined,
	init: function(){
		var width = window.innerWidth;
		var height = window.innerHeight;

		//set up state
		this.container = $('#game');

		this.sceneHUD = new THREE.Scene();
		this.cameraHUD = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10);
		this.cameraHUD.position.z = 10;

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0xbfd1e5,game.viewRange * game.chunkSize / 100000);
		this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 20000);

		//setup
		this.setUpScene();
		this.setUpHUD();

		this.voxelMap = new VoxelMap(this,{});
		this.player = new Player(this,this.camera);
		this.chunkLoader = new ChunkLoader(this.voxelMap);

		var chunkGenerator = new ChunkGeneratorHills({
			width: 40*game.chunkSize-1,
			height: 40*game.chunkSize-1,
			levels: [
				{
					quality: 10,
					fractal: 4,
					stop: false,
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
					quality: 10,
					fractal: 4,
					stop: false,
					blocks: [
						{
							block: 'dirt',
							height: 1000,
						}
					]
				},
				{
					quality: 4,
					fractal: 4,
					stop: true,
					blocks: [
						{
							block: undefined,
							height: 1000,
						}
					]
				},
				{
					quality: 10,
					fractal: 4,
					stop: false,
					blocks: [
						{
							block: 'stone',
							height: 1000,
						}
					]
				},
			]
		})

		this.voxelMap.setChunkGenerator(chunkGenerator);

		this.chunkLoader.startTimers();
		
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
		}.bind(this));

		// Hook pointer lock state change events
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', this.pointerlockchange.bind(this));
		$(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange', this.pointerlockchange.bind(this));

		$(document).keyup(function(event) {
			if(!this.enabled) return;
			switch(event.keyCode){
				case 192:
				case 27:
					this.keypress._registered_combos[0].on_keyup.call(this.keypress._registered_combos[0].this);
					break;
			}
		}.bind(this));
	},
	setUpScene: function(){
		//light
		this.lightGroup = new THREE.Group();
		this.scene.add(this.lightGroup);

	    // SUN
		var sun = new THREE.DirectionalLight( 0xffffff, 1 );
		sun.color.setHSL( 0.1, 1, 0.95 );
		sun.position.set( -1, 1.75, 1 );
	    sun.position.multiplyScalar(5000);

	    var shadowNear = 1200;
	    var shadowFar = 15000;

	    sun.castShadow = true;

	    sun.shadowCameraNear = shadowNear;
	    sun.shadowCameraFar = shadowFar;
	    
		sun.shadowBias = -0.0001;

	    sun.shadowMapDarkness = 0.8;
	    sun.shadowMapWidth = 1280 * 2;
	    sun.shadowMapHeight = 1280 * 2;

	    var size = 1000;
	    sun.shadowCameraLeft = -size;
	    sun.shadowCameraRight = size;
	    sun.shadowCameraTop = size;
	    sun.shadowCameraBottom = -size;

	    // sun.shadowCameraVisible = true;

	    this.lightGroup.add(sun);
	    this.lightGroup.add(sun.target);

	    // ambient light
		var ambient = new THREE.AmbientLight( 0x888888 );
	    this.lightGroup.add(ambient);

		// SKYDOME
		var vertexShader = document.getElementById('vertexShader').textContent;
		var fragmentShader = document.getElementById('fragmentShader').textContent;
		var uniforms = {
			topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
			bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
			offset:		 { type: "f", value: 33 },
			exponent:	 { type: "f", value: 0.6 }
		};
		uniforms.topColor.value.setHSL( 0.6, 1, 0.6 );;

		// scene.fog.color.copy( uniforms.bottomColor.value );

		var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
		var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });

		var sky = new THREE.Mesh(skyGeo, skyMat);
		this.lightGroup.add(sky);

		// stats
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
	update: function(dtime){
		this.animate(dtime);
		this.render(dtime);

		//update player position
		if(this.loadedMap){
			this.loadedMap.data.player.position.copy(this.player.position);
			this.loadedMap.data.player.velocity.copy(this.player.movement.velocity);
		}

		this.chunkLoader.setPosition(this.player.position);
	},
	animate: function(dtime){
		this.stats.update();

		this.player.update(dtime);

		this.lightGroup.position.copy(this.player.position);
	},

	render: function(dtime){
	    renderer.clear();
		renderer.render(this.scene, this.camera);
		renderer.clearDepth();
		renderer.render(this.sceneHUD, this.cameraHUD);
	},

	requestPointerLock: function(){
		this.player.enabled = true;
		// Ask the browser to lock the pointer
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || function(){};

		if(/Firefox/i.test(navigator.userAgent)) {

		} 
		document.body.requestPointerLock();
	},
	requestFullscreen: function(){
		document.body.requestFullscreen = document.body.requestFullscreen || document.body.mozRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen;
		document.body.requestFullscreen();
	},
	exitPointerLock: function(){
		this.player.enabled = false;
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || function(){};
	    document.exitPointerLock();
	},
	exitFullscreen: function(){

	},
	pointerlockchange: function (event) {
		if ( document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body ) {
			this.player.enabled = true;
		} 
		else {
			this.player.enabled = false;
		}
	},
	fullscreenchange: function(event){

	},

	loadMap: function(map){
		this.voxelMap.saveAllChunks(function(){
			this.loadedMap = map;
			this.voxelMap.removeAllChunks();
			this.voxelMap.setMapLoader(map.mapLoader);

			//set player position
			this.player.position.copy(this.loadedMap.data.player.position);
			this.player.movement.velocity.copy(this.loadedMap.data.player.velocity);


			if(this.player.position.empty()){
				// set player position
				var y = this.voxelMap.chunkGenerator.getHeight(0,0);
				this.player.position.y = (_.max(y) + 4) * game.blockSize;
			}
		}.bind(this))
	},

	modal: {
		menu: 'none',
		esc: {
			back: function(){
				game.requestPointerLock();
				game.modal.menu('none');
			},
			fullscreen: function(){
				game.requestFullscreen();
			},
			menu: function(){
				game.voxelMap.saveAllChunks();
				states.enableState('menu');
			},
		},
		blocks: {
			selectedMaterial: observable('stone',function(val){
				game.player.selection.place.material = val;
			}),
			selectedShape: observable('cube',function(val){
				game.player.selection.place.shape = val;
			}),
			materials: [],
			shapes: [],
			update: function(){
				var self = game.modal.blocks;

				self.materials([]);
				var a = materials.materials;
				for (var i in a) {
					var mat = a[i];
					self.materials.push({
						id: mat.id,
						name: mat.name,
						type: 'block',
						material: mat.material.map.sourceFile
					})
				};

				self.shapes([]);
				var a = shapes.shapes;
				for (var i in a) {
					var shape = a[i];
					self.shapes.push({
						id: shape.id,
						name: shape.name,
						image: shape.image
					})
				};
			}
		}
	}
}
Object.defineProperties(game,{
	viewRange: {
		get: function(){
			return parseInt(menu.modal.settings.graphics.viewRange());
		}
	}
})

states.addState('game',game);

//create the keypress object
game.keypress = keyboard.createState([
	{
		keys: 'esc',
		on_keyup: function(){
			if(this.modal.menu() == 'esc'){
				this.modal.menu('none');
				this.requestPointerLock();
			}
			else{
				this.modal.menu('esc');
				this.exitPointerLock();
			}
		},
		this: game
	},
	{
		keys: 'e',
		on_keyup: function(){
			if(this.modal.menu() == 'none'){
				this.modal.menu('invt');
				this.exitPointerLock();
			}
			else if(this.modal.menu() == 'invt'){
				this.modal.menu('none');
				this.requestPointerLock();
			}
		},
		this: game
	},
	{
		keys: 'f8',
		on_keyup: function(){
			this.voxelMap.debug = !this.voxelMap.debug;
		},
		this: game
	},
],'game');