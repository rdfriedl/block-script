import Vue from 'vue';
import App from './components/App.vue';

// import libraries
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-toggle';
import 'bootstrap-dialog';

// css
import 'fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/superhero/bootstrap.min.css';
import 'bootstrap-toggle/css/bootstrap-toggle.min.css';
import 'bootstrap-dialog/dist/css/bootstrap-dialog.min.css';

import url from './res/models/shapes/cone.dae';
console.log(url);
console.log(require('./res/models/shapes/cube.dae'));

import sound from './res/audio/dig/stone1.mp3';
console.log(sound);
console.log(require('./res/audio/dig/cloth1.ogg'));

new Vue({
	el: 'body',
	components: { App }
});
