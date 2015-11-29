var settingsDB;

//set up map settingsDB
settingsDB = new Dexie('block-script-settings');

// 1.7
settingsDB
	.version(1.7)
	.stores({
		map: 'id,parent',
		material: 'id,parent',
		folder: 'id,parent'
	})

// 1.6
settingsDB
	.version(1.6)
	.stores({
		map: 'id,parent',
		script: 'id,parent',
		room: 'id,parent',
		material: 'id,parent',
		folder: 'id,parent'
	})

// 1.5
settingsDB
	.version(1.5)
	.stores({
		map: 'id,parent',
		script: 'id,parent',
		room: 'id,parent',
		block: 'id,parent',
		folder: 'id,parent'
	})

// 1.4
settingsDB
	.version(1.4)
	.stores({
		map: 'id,parent',
		script: 'id,parent',
		room: 'id,parent',
		block: 'id,parent'
	});