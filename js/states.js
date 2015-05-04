//for handles game states, mainly menu, game, editor and maybe store
states = {
	states: {},
	events: new Events(),
	activeState: undefined,
	baseModal: {
		toggle: function(ob){
			return _.partial(function(ob){
				ob(!ob());
			},ob);
		},
		increase: function(ob,amount){
			return _.partial(function(ob,amount){
				amount = amount || 1;
				ob(ob()+amount);
			},ob,amount);
		},
		decrease: function(ob,amount){
			return _.partial(function(ob,amount){
				amount = amount || 1;
				ob(ob()-amount);
			},ob,amount);
		},
		combind: _.compose,
		set: function(ob,amount){
			return _.partial(function(ob,amount){
				ob(amount);
			},ob,amount);
		}
	},
	init: function(){
		//start up all states
		for (var i in this.states) {
			var state = this.states[i];
			state.init();

			//bindings
			fn.combindOver(state.modal,this.baseModal);
			state.modal = ko.mapping.fromJS(state.modal);
			ko.applyBindings(state.modal,state.container.get(0));

			//tell the state its ko is loaded
			state.events.emit('loaded');
		};
		this.disableAllStates(true);
	},
	update: function(){ //update loop for the active state
		var dtime = clock.getDelta() * 60;
		requestAnimationFrame(this.update.bind(this));
		if(this.activeState){
			if(this.activeState.update){
				this.activeState.update(dtime);
			}
		}
	},
	enableState: function(name,dontFade){
		this.disableAllStates();

		this.states[name].enabled = true;
		if(!dontFade){
			this.states[name].container.fadeIn() 
		}
		else{
			this.states[name].container.show();
		}
		this.states[name].enable();
		this.activeState = this.states[name];

		this.events.emit('stateEnabled',this.states[name]);
		this.states[name].events.emit('enabled');
	},
	disableState: function(name,dontFade){
		this.states[name].enabled = false;
		if(!dontFade){
			this.states[name].container.fadeOut() 
		}
		else{
			this.states[name].container.hide();
		}
		this.states[name].disable();

		this.events.emit('stateDisabled',this.states[name]);
		this.states[name].events.emit('disabled');
	},
	disableAllStates: function(dontFade){
		for (var i in this.states) {
			this.disableState(i,dontFade);
		};
		this.activeState = undefined;
	},
	addState: function(name,state){
		this.states[name] = state;
		this.events.emit('stateAdded',this.states[name]);
	}
}