//this file handles the scene/update/rendering of the menu
menu = {
	container: undefined,
	enabled: false,
	enable: function(){

	},
	disable: function(){

	},

	scene: undefined,
	camera: undefined,
	renderer: undefined,
	map: undefined,
	mouse: {
		x: 0,
		y: 0
	},
	init: function(){
		//set up state
		this.container = $('#menu');

		this.container.mousemove(function(event) {
			this.mouse.x = ( event.clientX - window.innerWidth/2 );
			this.mouse.y = ( event.clientY - window.innerHeight/2 );
		}.bind(this));

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1800;

		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.renderer.setClearColor( 0x000000, 0 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.container.append( this.renderer.domElement );

		this.map = new Map(this,this.scene,{});

		// this.setUpScene();

		$(window).resize(function(event) {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( window.innerWidth, window.innerHeight );
		}.bind(this));
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
			this.map.inportMapData(data);
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
		this.renderer.render(this.scene, this.camera);
	},
	modal: {
		menu: 'main',
		main: {
			play: function(){
				states.enableState('game');
				game.requestPointerLock();
			},
		},
		settings: {
			graphics: {
				viewRangeRange: [2,8],
				viewRange: 3,
			}
		}
	}
}

states.addState('menu',menu);