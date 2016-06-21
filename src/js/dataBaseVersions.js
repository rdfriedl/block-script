import Dexie from 'dexie';

//set up map settingsDB
let settingsDB = new Dexie('block-script-settings');

// 1.4
settingsDB
.version(1.4)
.stores({
	map: 'id,parent',
	script: 'id,parent',
	room: 'id,parent',
	block: 'id,parent'
});

// 1.5
settingsDB
.version(1.5)
.stores({
	map: 'id,parent',
	script: 'id,parent',
	room: 'id,parent',
	block: 'id,parent',
	folder: 'id,parent'
});


// 1.6
settingsDB
.version(1.6)
.stores({
	map: 'id,parent',
	script: 'id,parent',
	room: 'id,parent',
	material: 'id,parent',
	folder: 'id,parent'
});

// 2
settingsDB
.version(2)
.stores({
	maps: 'id,type,data',
	settings: 'id,data'
}).upgrade(function(trans){
	//nothing to do
});

export {settingsDB as default};
