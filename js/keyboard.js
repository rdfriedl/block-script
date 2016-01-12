// this class is for controlling the diffent keybaord controlls
var keyboard = {
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
		}
	},
	disableState: function(name){
		for (var i = 0; i < this.states.length; i++) {
			if(this.states[i].name == name && this.states[i].enabled){
				this.states[i].listener.stop_listening();
				this.states[i].enabled = false;
			}
		}
	},
	disableAllStates: function(){
		for (var i = 0; i < this.states.length; i++) {
			this.disableState(this.states[i].name);
		}
	},
	createState: function(keys,name){
		var listener = new keypress.Listener(document);
		listener.register_many(keys);
		this.addState(listener,name);
		return listener;
	}
};

//add mouse events to keypress
keypress._keycode_dictionary[301] = 'LMB';
keypress._keycode_dictionary[302] = 'MMB';
keypress._keycode_dictionary[303] = 'RMB';
keypress._keycode_dictionary[304] = 'MWU';
keypress._keycode_dictionary[305] = 'MWD';

$(document).ready(function() {
	$(document).mousedown(function(event) {
		if(keyboard.activeState){
			simulateKeyEvent(keyboard.activeState.listener.element,300+event.which,'keydown');
		}
	}).mouseup(function(event) {
		if(keyboard.activeState){
			simulateKeyEvent(keyboard.activeState.listener.element,300+event.which,'keyup');
		}
	});

	$(document).on('mousewheel',function(event) {
		if(keyboard.activeState){
			var char = 0;
			if(event.deltaY > 0) char = 304;
			if(event.deltaY < 0) char = 305;
			simulateKeyEvent(keyboard.activeState.listener.element,char,'keydown');
		}
	});
});

function simulateKeyEvent(el,char,type) {
  	var e = document.createEvent("KeyboardEvent");
  	if(e.initKeyboardEvent){
  		e.initKeyboardEvent(type || "keypress", true, true, window, char, char, 0, 0, 0, true);
  	}
  	else e.initKeyEvent(type || "keypress", true, true, window, char, char, 0, 0, 0, true);
  	Object.defineProperty(e,'keyCode',{
  		value: char
  	});
  	el.dispatchEvent(e);
}
