// import libraries
import 'script!jquery';
import Vue from 'vue';
import VueRouter from 'vue-router';
import 'script!bootstrap/dist/js/bootstrap.min.js';

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
	'/play': {component: GameComponent},
	'/credits': {component: CreditsMenuComponent},
	'/help': {component: HelpMenuComponent},
	'/help/:topic': {component: HelpMenuComponent},
	'/settings': {component: SettingsMenuComponent},
	'/settings/:topic': {component: SettingsMenuComponent},
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

// test methods
import MazeGenerator from './js/maze-generators/MazeGenerator.js';
import RecursiveBacktracker from './js/maze-generators/RecursiveBacktracker.js';
if(process.env.NODE_ENV == 'dev'){
	window.printMaze = function(sizeX,sizeY){
		sizeX = sizeX || 10;
		sizeY = sizeY || sizeX;
		let str = '';
		let maze = new RecursiveBacktracker(THREE.Vector2, new THREE.Vector2(sizeX, sizeY));
		// maze.start.set(0,0);
		maze.generate();

		let tmpVec = new THREE.Vector2();
		let X = MazeGenerator.DOOR_NONE;
		let P = MazeGenerator.DOOR_POSITIVE;
		let N = MazeGenerator.DOOR_NEGATIVE;
		for (let y = 0; y < sizeY; y++) {
			for (let x = 0; x < sizeX; x++) {
				let cell = maze.getCell(tmpVec.set(x,y)) || new THREE.Vector2();

				//strait
				if( cell.x == (P|N) && cell.y == (X) ) str += '─';
				if( cell.x == (X) && cell.y == (P|N) ) str += '│';

				//corners
				if( cell.x == (P) && cell.y == (P) ) str += '┌';
				if( cell.x == (N) && cell.y == (P) ) str += '┐';
				if( cell.x == (N) && cell.y == (N) ) str += '┘';
				if( cell.x == (P) && cell.y == (N) ) str += '└';

				// Ts
				if( cell.x == (P) && cell.y == (P|N) ) str += '├';
				if( cell.x == (N) && cell.y == (P|N) ) str += '┤';
				if( cell.x == (P|N) && cell.y == (P) ) str += '┬';
				if( cell.x == (P|N) && cell.y == (N) ) str += '┴';

				// ends
				if( cell.x == (P) && cell.y == (X) ) str += '╶';
				if( cell.x == (N) && cell.y == (X) ) str += '╴';
				if( cell.x == (X) && cell.y == (P) ) str += '╷';
				if( cell.x == (X) && cell.y == (N) ) str += '╵';

				// cross
				if( cell.x == (P|N) && cell.y == (P|N) ) str += '┼';

				// nothing
				if( cell.x == (X) && cell.y == (X)) str += ' ';
			}

			// new line
			str += '\n';
		}

		console.log('%c'+str, 'font-size: 2em; background-color: white; color: black;');

		return maze;
	}
}
