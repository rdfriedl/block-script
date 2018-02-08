// import libraries
import Vue from 'vue';
import VueRouter from 'vue-router';
import {devLog} from './util.js';

if(process.env.NODE_ENV == 'development'){
	window.Vue = Vue;
	Vue.config.debug = true;
	Vue.config.devtools = true;
}
else{
	Vue.config.silent = true;
}

// bootstrap
import 'script-loader!jquery';
import 'script-loader!bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/superhero/bootstrap.min.css';

// three.js
import THREE from 'three';
import './three-changes.js';

// add threejs to the global scope so its easier to debug
// if(process.env.NODE_ENV == 'development') window.THREE = THREE;

// css
import 'font-awesome';
import 'flex-layout-attribute';

import './css/style.css';
import './css/utils.css';

// load vue components
import GameComponent from './components/Game.vue';
import MenuComponent from './components/Menu.vue';
import CreditsMenuComponent from './components/menu/Credits.vue';
import HelpMenuComponent from './components/menu/Help.vue';
import SettingsMenuComponent from './components/menu/Settings.vue';
import RoomEditorComponent from './components/RoomEditor.vue';

// set up the config
Vue.use(VueRouter);
Vue.config.devtools = Vue.config.debug = process.env.NODE_ENV == 'development';

Vue.filter('nl-to-br', function(value){
	return String(value).replace(/\n/g,'<br>');
})

// create the router
let router = new VueRouter({
	routes: [
		{path: '/', component: MenuComponent},
		{path: '/menu', component: MenuComponent},
		{path: '/play', component: GameComponent},
		{path: '/credits', component: CreditsMenuComponent},
		{path: '/help', component: HelpMenuComponent},
		{path: '/help/:topic', component: HelpMenuComponent},
		{path: '/settings', component: SettingsMenuComponent},
		{path: '/settings/:topic', component: SettingsMenuComponent},
		{path: '/editor', component: RoomEditorComponent},
		{path: '/editor/:room', component: RoomEditorComponent}
	]
});

window.addEventListener('load', () => {
	// start vue
	devLog('starting vue.js');
	// var App = new Vue({
	// 	el: '#app',
	// 	router
	// })
	// router.start(App, '#app');
	new Vue({
		router,
		render(createElement){
			return createElement('router-view');
		}
	}).$mount('#app');

	// fix middle click
	document.body.addEventListener('mousedown', event => {
		if(event.button == 1) event.preventDefault();
	});

	// dont allow the user to drag images
	document.body.addEventListener('dragstart', event => {
		if(event.target.nodeName == 'IMG'){
			event.preventDefault();
			return false;
		}
	});

	// stop blank links
	document.body.addEventListener('click', event => {
		if(event.target.nodeName == 'A' && event.target.getAttribute('href') == '#'){
			event.preventDefault();
			return false;
		}
	});
});
