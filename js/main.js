var renderer, settingsDB;
var clock = new THREE.Clock();
var materialLoader = new THREE.MaterialLoader();

function initDB(cb){
	settingsDB.open().finally(function(){
		console.log('opened db')
		if(cb) cb();
	}.bind(this));

	settingsDB.on('error',function(err){
		console.log(err);
	});
}

$(document).ready(function() {
	Messenger.options = {
		maxMessages: 4,
    	extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    	theme: 'flat'
	};

	if(!Detector.webgl){
		Detector.addGetWebGLMessage();
		Messenger().error('webgl not supported')
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
		resources.init(function(){
			addDefaultResources();
			materials.compileMaterials();

			// blockPool.preAllocate(10000);
			states.init();

			//start loop
			states.update();
			
			$('body').fadeIn(500);
			states.enableState('menu');
		})
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

	$(document).on('dragend',function(event){
		event.preventDefault();
	})
	$(document).on('drop','.drop-zone',function(event){
		event.preventDefault();
	})
	$(document).on('dragover','.drop-zone',function(event){
		$(this).addClass('hover');
		event.stopPropagation();
		return true;
	})
	$(document).on('dragover',function(){
		$('.drop-zone').removeClass('hover');
		return false;
	})

	$(document).on('click','a[href="#"]',function(event){
		event.preventDefault();
	})

	$(window).focus(function(){
		clock.getDelta();
	})

	$(window).on('error',function(event){
		console.log(event)
	})
});

function readfiles(files, callback) {
	// for(var i=0; i < files.length; i++){
	// 	previewfile(files[i],callback);
	// }
	if(files[0]){
		previewfile(files[0],callback);
	}
}

function previewfile(file, callback) {
	var reader = new FileReader();
	reader.onload = function(event) {
		if (callback) {
			callback(event.target.result);
		}
	};
	reader.readAsText(file);
}