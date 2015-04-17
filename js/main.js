// var container, stats;
// var scene, renderer, camera;
// var sun, ambient, lightGroup;

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
function observable(val,cb){
	o = ko.observable(val);
	o.subscribe(cb);
	return o;
}
THREE.Vector3.prototype.sign = function(){
	Math.sign(this.x);
	Math.sign(this.y);
	Math.sign(this.z);
	return this;
}
THREE.Vector3.prototype.empty = function(){
	return this.x + this.y + this.z === 0;
}
THREE.Vector3.prototype.split = function(dirs){
	if(!dirs){
		//4
		var a = [];
		if(this.x!==0) a.push(new THREE.Vector3(this.x,0,0));
		if(this.y!==0) a.push(new THREE.Vector3(0,this.y,0));
		if(this.z!==0) a.push(new THREE.Vector3(0,0,this.z));
		return a;
	}
	else{
		//8
	}
}
THREE.Vector3.prototype.toString = function(){
	return this.x+'|'+this.y+'|'+this.z;
}

var audioPath = 'res/audio/';
var sounds = [
	{
		id: 'stone1',
		src: 'dig/stone1.ogg'
	},
	{
		id: 'stone2',
		src: 'dig/stone2.ogg'
	},
	{
		id: 'stone3',
		src: 'dig/stone3.ogg'
	},
	{
		id: 'stone4',
		src: 'dig/stone4.ogg'
	},
	{
		id: 'grass1',
		src: 'dig/grass1.ogg'
	},
	{
		id: 'grass2',
		src: 'dig/grass2.ogg'
	},
	{
		id: 'grass3',
		src: 'dig/grass3.ogg'
	},
	{
		id: 'grass4',
		src: 'dig/grass4.ogg'
	},
	{
		id: 'wood1',
		src: 'dig/wood1.ogg'
	},
	{
		id: 'wood2',
		src: 'dig/wood2.ogg'
	},
	{
		id: 'wood3',
		src: 'dig/wood3.ogg'
	},
	{
		id: 'wood4',
		src: 'dig/wood4.ogg'
	},
	{
		id: 'gravel1',
		src: 'dig/gravel1.ogg'
	},
	{
		id: 'gravel2',
		src: 'dig/gravel2.ogg'
	},
	{
		id: 'gravel3',
		src: 'dig/gravel3.ogg'
	},
	{
		id: 'gravel4',
		src: 'dig/gravel4.ogg'
	}
]

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