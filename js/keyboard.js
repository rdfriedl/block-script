// this class is for controlling the diffent keybaord controlls
keyboard = {
	states: [],
	activeState: undefined,

	addState: function(listener,name){
		listener.stop_listening();
		this.states.push({
			listener: listener,
			name: name,
			enabled: false
		});
	},
	enableState: function(name){
		this.disableAllStates();
		for (var i = 0; i < this.states.length; i++) {
			if(this.states[i].name == name && !this.states[i].enabled){
				this.states[i].listener.listen();
				this.states[i].enabled = true;
				this.activeState = this.states[i];
				break;
			}
		};
	},
	disableState: function(name){
		for (var i = 0; i < this.states.length; i++) {
			if(this.states[i].name == name && this.states[i].enabled){
				this.states[i].listener.stop_listening();
				this.states[i].enabled = false;
			}
		};
	},
	disableAllStates: function(){
		for (var i = 0; i < this.states.length; i++) {
			this.disableState(this.states[i].name);
		};
	},
	createState: function(keys,name){
		var listener = new keypress.Listener(document);
		listener.register_many(keys);
		this.addState(listener,name);
		return listener;
	}
}