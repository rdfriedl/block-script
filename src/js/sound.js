function Sounds(scene,opts){
	this.players = {};
	this.sounds = [];

	this.scene = scene;

	this.group = new THREE.Group();
	this.scene.add(this.group);

	this.listener = new THREE.AudioListener();
	this.group.add(this.listener);

	this.settings = {};
	this.settings.__proto__ = Sounds.prototype.settings;
	if(opts){
		for(var i in opts){
			this.settings[i] = opts[i];
		}
	}
}
Sounds.prototype = {
	players: {},
	sounds: [],
	listener: undefined,
	group: undefined,
	settings: {
		maxInstances: 10,
		range: 64
	},
	load: function(url,db){
		return new Promise(function(resolve,reject){
			$.getJSON(url, function(json){
				this.sounds = json;
			}.bind(this)).fail(function(event,type,error){
				reject(error);
			});
		}.bind(this));
	},
	getSound: function(soundID){
		for(var i in this.sounds){
			if(this.sounds[i].id == soundID){
				return this.sounds[i];
			}
		}
	},
	play: function(soundID,pos){
		var sound = this.getSound(soundID);
		if(!sound) return;

		var players = this.players[soundID] || (this.players[soundID] = []);
		var player;

		//find a player to use
		for(var i = 0; i < players.length; i++){
			if(players[i].isPlaying === false){
				//use this one
				player = players[i];

				//position it
				if(pos)
					player.position.copy(pos);
				else
					player.position.copy(this.listener.getWorldPosition());

				//play it
				player.play();
				return;
			}
		}
		//create a new one
		if(players.length < this.settings.maxInstances){
			player = new THREE.Audio(this.listener);
			player.load(sound.src);
			player.setRefDistance(this.settings.range);
			player.autoplay = true;

			//add it
			players.push(player);
			this.group.add(player);

			//position it
			if(pos)
				player.position.copy(pos);
			else
				player.position.copy(this.listener.getWorldPosition());
		}
	}
};
