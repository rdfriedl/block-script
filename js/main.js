var container, stats;
var scene, renderer;
var sun, ambient, lightGroup;
var viewDistance = 3;

function positionToIndex(position,size){
	return (position.z*size*size)+(position.y*size)+position.x;
}
function indexToPosition(index,size){
	var position = new THREE.Vector3(0,0,0);
	position.z = Math.floor(index/(size*size));
	position.y = Math.floor((index-(position.z*(size*size)))/size);
	position.x = index-(position.y*size)-(position.z*size*size);
	return position;
}

function init() {
	container = document.getElementById( 'container' );

	//scene
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xbfd1e5,viewDistance * map.chunkSize / 100000);

	player.init();

	//light
	lightGroup = new THREE.Group();
	scene.add(lightGroup);

	ambient = new THREE.AmbientLight( 0x888888 );
    lightGroup.add(ambient);

    var shadowNear = 1200;
    var shadowFar = 15000;

	sun = new THREE.DirectionalLight( 0xffffff, 1 );
	sun.position.set( 0, 1, 0 );
    sun.position.multiplyScalar(5000);

    sun.castShadow = true;
    // sun.onlyShadow = true;

    sun.shadowCameraNear = shadowNear;
    sun.shadowCameraFar = shadowFar;

    sun.shadowBias = 0.0001;
    sun.shadowMapDarkness = 0.8;
    sun.shadowMapWidth = 2048 * 2;
    sun.shadowMapHeight = 2048 * 2;

    var size = 1500;
    sun.shadowCameraLeft = -size;
    sun.shadowCameraRight = size;
    sun.shadowCameraTop = size;
    sun.shadowCameraBottom = -size;

    // sun.shadowCameraVisible = true;

    lightGroup.add(sun);
    lightGroup.add(sun.target);

    lightGroup.rotateX(THREE.Math.degToRad(20));
    lightGroup.rotateZ(THREE.Math.degToRad(40));

	//renderer

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xbfd1e5 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

	container.innerHTML = "";

	container.appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
}

function update(){
	requestAnimationFrame(update);

	animate();
	render();
}

function animate() {
	stats.update();

	player.update();

	lightGroup.position.copy(player.position);
}

function render() {
	renderer.render( scene, player.camera );
}

function loadChunkLoop(){
	var depth = 2;
	var func = function(x,z,dist,cb){
		var loaded = true;
		for (var y = -depth; y <= depth; y++) {
			var position = player.position.clone();
			position.x = Math.floor(position.x / (map.chunkSize*map.blockSize)) + x;
			position.y = Math.floor(position.y / (map.chunkSize*map.blockSize)) + y;
			position.z = Math.floor(position.z / (map.chunkSize*map.blockSize)) + z;
			loaded = (!loaded)? loaded : map.chunkLoaded(position);
		};
		loaded = !!loaded;

		if(!loaded){
			// cb = _.after(depth*2+1,cb);
			//load
			for (var y = -depth; y <= depth; y++) {
				var position = player.position.clone();
				position.x = Math.floor(position.x / (map.chunkSize*map.blockSize)) + x;
				position.y = Math.floor(position.y / (map.chunkSize*map.blockSize)) + y;
				position.z = Math.floor(position.z / (map.chunkSize*map.blockSize)) + z;
				
				map.getChunk(position);
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
			if(dist > viewDistance){
				cb();
				return;
			}

			func(x,z,dist,cb);
		}
	}
	func(0,0,0,function(){
		setTimeout(loadChunkLoop,50);
	});
}

function unloadChunkLoop(){
	var position = player.position.clone();
	position.x = Math.floor(position.x / (map.chunkSize*map.blockSize));
	position.y = Math.floor(position.y / (map.chunkSize*map.blockSize));
	position.z = Math.floor(position.z / (map.chunkSize*map.blockSize));

	for (var i in map.chunks) {
		var chunk = map.chunks[i]
		if(chunk.mesh){
			if(Math.abs(map.chunks[i].position.x - position.x) > viewDistance || Math.abs(map.chunks[i].position.y - position.y) > viewDistance || Math.abs(map.chunks[i].position.z - position.z) > viewDistance){
				// if(chunk.mesh.parent) map.group.remove(chunk.mesh);
				chunk.remove();
			}
			// else{
			// 	if(!chunk.mesh.parent) map.group.add(chunk.mesh);
			// }
		}
	};

	setTimeout(unloadChunkLoop,500);
}

$(document).ready(function() {
	if(!Detector.webgl){
		Detector.addGetWebGLMessage();
	}

	init();
	blocks.init()
	update();
	map.init();
	var mapLoader = new MapLoaderIndexeddb({
		dbName: 'map'
	});
	var chunkGenerator = new ChunkGeneratorHills({
		width: 40*map.chunkSize-1,
		height: 40*map.chunkSize-1,
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
	// var chunkGenerator = new RoomGenerator();
	// var chunkGenerator = new FladGenerator();
	
	map.setMapLoader(mapLoader);
	map.setChunkGenerator(chunkGenerator);

	//set cameras position
	player.position.x = (map.chunkGenerator.options.width*map.blockSize) / 2;
	player.position.z = (map.chunkGenerator.options.height*map.blockSize) / 2;
	var y = map.chunkGenerator.getY(
			Math.floor(player.position.x/map.blockSize),
			Math.floor(player.position.z/map.blockSize)
		);
	player.position.y = (Math.max(y[0],y[1],y[2],y[3]) + 4) * map.blockSize;
	// player.position.set(64,64,64);

	$(window).resize(function(event) {
		player.camera.aspect = window.innerWidth / window.innerHeight;
		player.camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	});

	//load chunk loop
	loadChunkLoop();
	unloadChunkLoop();

	//movement
	$('body').keydown(function(event) {
		event.preventDefault();
		player.keydown(event);
	}).keyup(function(event) {
		event.preventDefault();
		player.keyup(event);
	});

	//pointer lock
	element = document.body;

	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			player.controls.enabled = true;

			$('#pointer-lock').hide();
		} 
		else {
			player.controls.enabled = false;

			$('#pointer-lock').css('display','-webkit-box');
			$('#pointer-lock').css('display','-moz-box');
			$('#pointer-lock').css('display','box');
		}
	}

	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	}

	// Hook pointer lock state change events
	$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', pointerlockchange);
	$(document).on('pointerlockerror mozpointerlockerror webkitpointerlockerror', pointerlockerror);

	$('#pointer-lock').click(function(event){
		$('#pointer-lock').hide();

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if(/Firefox/i.test(navigator.userAgent)) {
			var fullscreenchange = function(event) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener('fullscreenchange', fullscreenchange);
					document.removeEventListener('mozfullscreenchange', fullscreenchange);

					element.requestPointerLock();
				}
			}

			document.addEventListener('fullscreenchange', fullscreenchange, false);
			document.addEventListener('mozfullscreenchange', fullscreenchange, false);

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();
		} 
		else {
			element.requestPointerLock();
		}
	});
	$('body').on('contextmenu',function(event){
		event.preventDefault();
	})
});

//list all indexedDBs
// indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args)
// { console.log(sender.target.result); };