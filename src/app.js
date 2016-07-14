// import libraries
import $ from 'jquery';
import Vue from 'vue';
import VueRouter from 'vue-router';
import 'bootstrap-js';
import 'bootstrap-toggle-js';

// three.js
import THREE from 'three';
import './js/three-changes.js';
if(process.env.NODE_ENV == 'dev') window.THREE = THREE;

// css
import 'font-awesome';
import 'bootstrap-css';
import 'bootswatch-superhero';
import 'bootstrap-toggle-css';
import 'bootstrap-dialog-css';
import 'flex-layout-attribute';

import './css/style.css';
import './css/utils.css';

import './js/util.js';

// load vue components
import GameComponent from './components/Game.vue';
import MenuComponent from './components/Menu.vue';
import CreditsMenuComponent from './components/menu/Credits.vue';
import HelpMenuComponent from './components/menu/Help.vue';
import SettingsMenuComponent from './components/menu/Settings.vue';
import MapsMenuComponent from './components/menu/Maps.vue';
import RoomEditorComponent from './components/RoomEditor.vue';

// set up the config
Vue.use(VueRouter);
Vue.config.devtools = Vue.config.debug = process.env.NODE_ENV == 'dev';

Vue.filter('nl-to-br', function(value){
	return String(value).replace(/\n/g,'<br>');
})

//create the router
let router = new VueRouter();
router.map({
	'': {component: MenuComponent},
	'/menu': {component: MenuComponent},
	'/play/:mapID': {component: GameComponent},
	'/credits': {component: CreditsMenuComponent},
	'/help': {component: HelpMenuComponent},
	'/help/:topic': {component: HelpMenuComponent},
	'/settings': {component: SettingsMenuComponent},
	'/settings/:topic': {component: SettingsMenuComponent},
	'/maps': {component: MapsMenuComponent},
	'/maps/:modal': {component: MapsMenuComponent},
	'/editor': {component: RoomEditorComponent},
	'/editor/:room': {component: RoomEditorComponent}
});

// start vue
router.start(Vue.extend({}), 'body');

$(document).ready(function() {
	//fix middle click
	$(document).on('mousedown',function(event){
		if(event.button == 1) event.preventDefault();
	});

	//dont allow the user to drag images
	$(document).on('dragstart','img',function(event){
		event.preventDefault();
		return false;
	});

	//stop blank links
	$(document).on('click','a[href="#"]',function(event){
		event.preventDefault();
	});
});
