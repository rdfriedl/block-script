var renderer, settingsDB;
var clock = new THREE.Clock();

function initDB(cb){
	//set up map settingsDB
	settingsDB = new Dexie('block-script-settings');
	settingsDB.version(1)
		.stores({
			maps: 'id,name,desc,dbName,createDate,settings'
		});

	settingsDB.open().then(function(){
		console.log('opened db')
		if(cb) cb();
	}.bind(this));

	settingsDB.on('error',function(err){
		console.log(err);
	});
}

$(document).ready(function() {
	if(!Detector.webgl){
		Detector.addGetWebGLMessage();
	}

	//create renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
	$('body').prepend(renderer.domElement);

	$(window).resize(function(event) {
		renderer.setSize( window.innerWidth, window.innerHeight );
	}.bind(this));

	initDB(function(){
		blocks.init(function(){
			states.init();

			//start loop
			states.update();
			
			$('body').fadeIn(500);
			states.enableState('menu');
		});
	});

	//load sound
	createjs.Sound.registerSounds(sounds, audioPath);

	//show menu
	$(document).on('contextmenu',function(event){
		event.preventDefault();
	})

	//dont allow the user to drag images
	$(document).on('dragstart','img',function(event){
		event.preventDefault();
		return false;
	})

	$('form.no-action').submit(function(event){
		event.preventDefault();
	})
});

//list all indexedDBs
// indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args)
// { console.log(sender.target.result); };