settings = {
	container: undefined,
	enabled: false,
	enable: function(){

	},
	disable: function(){

	},

	chunkSize: 10,
	blockSize: 32,
	init: function(){
		//set up state
		this.container = $('#settings');
		
	},
	update: function(){
		
	},
	modal: {
		graphics: {
			viewRangeRange: [2,8],
			viewRange: 3,
		},
		back: function(){
			states.enableState('menu');
		}
	}
}
Object.defineProperties(settings,{
	viewRange: {
		get: function(){
			return parseInt(menu.modal.settings.graphics.viewRange());
		}
	}
})

states.addState('settings',settings);