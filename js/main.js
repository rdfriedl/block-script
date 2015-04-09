var container, stats;
var camera, controls, scene, renderer;
var mesh;
var sun, ambient, lightGroup;
var viewDistance = 5;
var moveRight, moveLeft, moveForward, moveBackward, moveUp, moveDown, movementSpeed = 6;

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

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );

	controls = new THREE.PointerLockControls( camera );
	scene.add(controls.getObject());

	//light
	lightGroup = new THREE.Group();
	scene.add(lightGroup);

	ambient = new THREE.AmbientLight( 0xbfd1e5 );
    lightGroup.add(ambient);

    var shadowNear = 1200;
    var shadowFar = 15000;

	sun = new THREE.DirectionalLight( 0xffffff, 1 );
	sun.position.set( 0, 1, 0 );
    sun.position.multiplyScalar(5000);

    sun.castShadow = true;

    sun.shadowCameraNear = shadowNear;
    sun.shadowCameraFar = shadowFar;

    sun.shadowBias = 0.0001;
    sun.shadowMapDarkness = 0.5;
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

    createSideLight = function(x,z,top){
    	var light = new THREE.DirectionalLight(0xffffff, 1);
	    light.position.set(x,0,z);
	    light.position.multiplyScalar(size*2);
	    light.position.y = sun.position.y;

	    light.target.position.set(light.position.x,0,light.position.z);

	    light.castShadow = true;

	    light.onlyShadow = true;
	    light.shadowCameraNear = shadowNear;
	    light.shadowCameraFar = shadowFar;

	    light.shadowMapBias = 0.01;
	    light.shadowMapDarkness = 0.5;
	    light.shadowMapWidth = 1280;
	    light.shadowMapHeight = 1280;

	    light.shadowCameraLeft = -size * ((top)? 2 : 1);
	    light.shadowCameraRight = size * ((top)? 2 : 1);
	    light.shadowCameraTop = size * ((top)? 1 : 2);
	    light.shadowCameraBottom = -size * ((top)? 1 : 2);

	    // light.shadowCameraVisible = true;

	    lightGroup.add(light);
	    lightGroup.add(light.target);
    }

    // createSideLight(-0.5,1,false)
    // createSideLight(0.5,-1,false)

    // createSideLight(1,0.5,true)
    // createSideLight(-1,-0.5,true)

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

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
}

function update(){
	requestAnimationFrame(update);

	animate();
	render();
}

function animate() {
	stats.update();

	//move
	var rotation = controls.getDirection(new THREE.Vector3());
	var oldPos = controls.getObject().position.clone();

	//y
	if(moveUp) controls.getObject().translateY(movementSpeed)
	if(moveDown) controls.getObject().translateY(-movementSpeed)

	var pos = controls.getObject().position.clone()
	if(moveUp) pos.y += 15;
	if(moveDown) pos.y -= 15;
	pos.divideScalar(map.blockSize).floor();
	if(map.getBlock(pos) instanceof SolidBlock) controls.getObject().position.y = oldPos.y;

	//z
	if(moveForward) controls.getObject().translateZ(-movementSpeed)
	if(moveBackward) controls.getObject().translateZ(movementSpeed * 0.6)

	//x
	if(moveRight) controls.getObject().translateX(movementSpeed * 0.6)
	if(moveLeft) controls.getObject().translateX(-movementSpeed * 0.6)

	var pos = controls.getObject().position.clone()
	pos.divideScalar(map.blockSize).floor();
	if(map.getBlock(pos) instanceof SolidBlock){
		controls.getObject().position.x = oldPos.x;
		controls.getObject().position.z = oldPos.z;
	}

	lightGroup.position.copy(controls.getObject().position);
}

function render() {
	renderer.render( scene, camera );
}

function loadChunkLoop(){
	var depth = 2;
	var func = function(x,z,dist,cb){
		var loaded = true;
		for (var y = -depth; y <= depth; y++) {
			var position = controls.getObject().position.clone();
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
				var position = controls.getObject().position.clone();
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
	var position = controls.getObject().position.clone();
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
	controls.getObject().position.x = (map.chunkGenerator.options.width*map.blockSize) / 2;
	controls.getObject().position.z = (map.chunkGenerator.options.height*map.blockSize) / 2;
	var y = map.chunkGenerator.getY(
			Math.floor(controls.getObject().position.x/map.blockSize),
			Math.floor(controls.getObject().position.z/map.blockSize)
		);
	controls.getObject().position.y = (Math.max(y[0],y[1],y[2],y[3]) + 4) * map.blockSize;

	$(window).resize(function(event) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	});

	//load chunk loop
	loadChunkLoop();
	unloadChunkLoop();

	//movement
	$('body').keydown(function(event) {
		event.preventDefault();
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				moveUp = true;
				break;

			case 18: // ctrl
				moveDown = true;
				break;

			case 16: // shift
				movementSpeed = 10;
				break;
		}
	}).keyup(function(event) {
		event.preventDefault();
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false; 
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 32: // space
				moveUp = false;
				break;

			case 18: // ctrl
				moveDown = false;
				break;

			case 16: // shift
				movementSpeed = 6;
				break;
		}
	});

	//pointer lock
	element = document.body;

	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controls.enabled = true;

			$('#pointer-lock').hide();
		} 
		else {
			controls.enabled = false;

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