var settingsDB;

//set up map settingsDB
settingsDB = new Dexie('block-script-settings');

// 1.7
settingsDB
	.version(1.7)
	.stores({
		map: 'id,parent',
		settings: 'id,data'
	})