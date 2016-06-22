<!-- HTML -->
<template>

<menu></menu>
<game></game>
<router-view></router-view>

</template>

<!-- JS -->
<script>

import Vue from 'vue';
import Game from './Game.vue';
import Menu from './Menu.vue';

let App = Vue.extend({
	components: {
		Game,
		Menu
	}
});

export {App as default};

</script>

<!-- CSS -->
<style>

@font-face {
    font-family: Font;
    src: url(../fonts/cubicfive10.ttf);
}
html, body, *{
	font-family: Font;
}

html,body{
	width: 100%;
	height: 100%;
}

/* #app {
	margin-top: -100px;
	max-width: 600px;
	font-family: Source Sans Pro, Helvetica, sans-serif;
	text-align: center;
}

.logo {
	width: 100px;
	height: 100px;
} */

</style>
