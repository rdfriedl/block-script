var settingsDB;

//set up map settingsDB
settingsDB = new Dexie('block-script-settings');

// 1.7
settingsDB
	.version(2)
	.stores({
		maps: 'id,type,data',
		settings: 'id,data'
	})