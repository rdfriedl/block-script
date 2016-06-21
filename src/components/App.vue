<!-- HTML -->
<template>

<div id="app">
	<i class="fa fa-github"></i>
	<img class="logo" src="../res/img/logo.png" height="200" width="200">
	<hello></hello>
	<game></game>
	<p>
		Welcome to your Vue.js app!
	</p>
	<p>
		To get a better understanding of how this boilerplate works, check out
		<a href="http://vuejs-templates.github.io/webpack" target="_blank">its documentation</a>.
		It is also recommended to go through the docs for
		<a href="http://webpack.github.io/" target="_blank">Webpack</a> and
		<a href="http://vuejs.github.io/vue-loader/" target="_blank">vue-loader</a>.
		If you have any issues with the setup, please file an issue at this boilerplate's
		<a href="https://github.com/vuejs-templates/webpack" target="_blank">repository</a>.
	</p>
	<p>
		You may also want to checkout
		<a href="https://github.com/vuejs/vue-router/" target="_blank">vue-router</a> for routing and
		<a href="https://github.com/vuejs/vuex/" target="_blank">vuex</a> for state management.
	</p>
</div>

</template>

<!-- JS -->
<script>

import Hello from './Hello.vue';
import Game from './Game.vue';

export default {
	components: {
		Hello,
		Game
	}
};

</script>

<!-- CSS -->
<style>

@font-face {
    font-family: Font;
    src: url(../fonts/cubicfive10.ttf);
}
*{
	font-family: Font;
}

html,body{
	width: 100%;
	height: 100%;
}

body {
	display: flex;
	align-items: center;
	justify-content: center;
}

#app {
	margin-top: -100px;
	max-width: 600px;
	font-family: Source Sans Pro, Helvetica, sans-serif;
	text-align: center;
}

.logo {
	width: 100px;
	height: 100px;
}

</style>
