// import libraries
import $ from 'jquery';
import ko from 'knockout';
import Vue from 'vue';
import VueRouter from 'vue-router';
import 'bootstrap';
import 'bootstrap-toggle';
import BootstrapDialog from 'bootstrap-dialog';

// three.js
import THREE from 'three';
if(process.env.NODE_ENV == 'dev') window.THREE = THREE;

// css
import 'font-awesome';
import 'bootstrap-css';
import 'bootswatch-superhero';
import 'bootstrap-toggle-css';
import 'bootstrap-dialog-css';

import './css/style.css';
import './css/utils.css';

import './js/util.js';
// import settingsDB from './js/dataBaseVersions.js';
// import {Materials} from './js/materials.js';
// import {initSettings} from './js/settings.js';
// import defineMaterials from './js/defineMaterials.js';
// import './js/defineShapes.js';
// import {blockPool} from './js/block.js';

// import {states} from './js/states.js';
// import menu from './js/states/menu.js';
// import game from './js/states/game.js';

// load vue components
import GameComponent from './components/Game.vue';
import MenuComponent from './components/Menu.vue';
import CreditsMenuComponent from './components/menu/Credits.vue';
import HelpMenuComponent from './components/menu/Help.vue';
import SettingsMenuComponent from './components/menu/Settings.vue';
import MapsMenuComponent from './components/menu/Maps.vue';

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
	'/maps/:modal': {component: MapsMenuComponent}
});

// start vue
router.start(Vue.extend({}), 'body');

// main.js
// window.renderer = undefined;
// window.clock = new THREE.Clock();
// window.materialLoader = new THREE.MaterialLoader();
// window.settings = undefined;

// function initDB(cb){
// 	return settingsDB.open().then(function(){
// 		if(cb) cb();
// 	});
// }

// function catchError(message,cb){
// 	return function(e){
// 		console.error(message);
// 		console.error(e);
// 		if(cb) cb();
// 	};
// }

$(document).ready(function() {
	//create renderer
	// renderer = new THREE.WebGLRenderer({
	//     preserveDrawingBuffer: true
	// });
	// renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setSize( window.innerWidth, window.innerHeight );
 //    renderer.autoClear = false;
	// $('body').prepend(renderer.domElement);

	//resize renderer
	// NOTE: keep for game.vue
	// $(window).resize(function(event) {
	// 	renderer.setSize( window.innerWidth, window.innerHeight );
	// }.bind(this));

	//start
	// Promise.all([
	// 	initDB(),
	// 	initSettings()
	// ]).then(function(){
	// 	defineMaterials();

	// 	blockPool.preAllocate(10000);
	// 	states.init();

	// 	//start loop
	// 	states.update();

	// 	states.enableState('menu');
	// }).catch(catchError('failed to start',function(){
	// 	BootstrapDialog.confirm({
	// 		title: 'DataBase Error',
	// 		message: 'Failed to load the database.<br>This maybe caused by an older database version.<br><br>Click "Clear DataBase" to removed all local data and recreate the DataBase.',
	// 		type: BootstrapDialog.TYPE_DANGER,
	// 		closable: false,
	// 		btnCancelLabel: 'Try Again',
	// 		btnOKLabel: 'Clear DataBase',
	// 		btnOKClass: 'btn-danger',
	// 		callback: function(result){
	//             if(result) {
	//             	settingsDB.delete().then(function(){
	//             		location.reload();
	//             	});
	//             }
	//             else {
	//             	location.reload();
	//             }
	//         }
	//     });
	// }));

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

	//fix bug with clock laging when window looses focus
	// NOTE: keep for game.vue
	// $(window).focus(function(){
	// 	clock.getDelta();
	// });
});
