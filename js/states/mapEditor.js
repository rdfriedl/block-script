//this file handles the scene/update/rendering of the script editor
mapEditor = {
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
		this.container = $('#map-editor');
		
	},

	update: function(dtime){

	},

	modal: {
		
	}
}

states.addState('mapEditor',mapEditor);