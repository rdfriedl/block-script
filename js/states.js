//for handles game states, mainly menu, game, editor and maybe store
states = {
	states: {},
	events: new Events(),
	activeState: undefined,
	lastActiveState: undefined,
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
			state.events.emit('load');
		};
		this.disableAllStates(true);
	},
	update: function(){ //update loop for the active state
		var dtime = clock.getDelta() * 60;
		// if(dtime > 10) dtime = 10;
		requestAnimationFrame(this.update.bind(this));
		if(this.activeState){
			if(this.activeState.update){
				this.activeState.update(dtime);
			}
		}
	},
	enableState: function(name,dontFade){
		if(this.states[name].enabled) return;

		//find the last states name
		for(var i in this.states){
			if(this.states[i] == this.lastActiveState){
				$('#states').removeClass('active-'+i).removeClass('last-'+i);
			}
			if(this.states[i] == this.activeState){
				$('#states').removeClass('active-'+i).addClass('last-'+i);
			}
		}
		this.lastActiveState = this.activeState;
		$('#states').addClass('active-'+name);

		this.disableAllStates();

		this.states[name].enabled = true;
		if(!dontFade){
			this.states[name].container.removeClass('disable').addClass('active').fadeIn();
		}
		else{
			this.states[name].container.removeClass('disable').addClass('active').show();
		}
		this.states[name].enable();
		this.activeState = this.states[name];

		this.events.emit('stateEnabled',this.states[name]);
		this.states[name].events.emit('enabled');
	},
	disableState: function(name,dontFade){
		this.states[name].enabled = false;
		if(!dontFade){
			this.states[name].container.removeClass('active').addClass('disable').fadeOut() 
		}
		else{
			this.states[name].container.removeClass('active').addClass('disable').hide();
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