$(document).ready(function() {
	if(!Detector.webgl){
		Detector.addGetWebGLMessage();
	}

	// init();
	blocks.init();
	states.init();

	//load sound
	createjs.Sound.registerSounds(sounds, audioPath);

	//start loop
	states.update();

	//show menu
	$('body').fadeIn(500);
	states.enableState('menu');
	$(document).on('contextmenu',function(event){
		event.preventDefault();
	})
});

//list all indexedDBs
// indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args)
// { console.log(sender.target.result); };