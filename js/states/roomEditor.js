//this file handles the scene/update/rendering of the script editor
roomEditor = {
	container: undefined,
	enabled: false,
	enable: function(){

	},
	disable: function(){

	},

	events: new Events(),
	scene: undefined,
	camera: undefined,
	renderer: undefined,
	init: function(){
		//set up state
		this.container = $('#room-editor');
		
	},

	update: function(dtime){

	},
	animate: function(dtime){
		
	},
	render: function(dtime){

	},

	modal: {
		back: 'menu',
		goBack: function(){
			var self = roomEditor.modal;
			states.enableState(self.back());
		}
	}
}

states.addState('roomEditor',roomEditor);