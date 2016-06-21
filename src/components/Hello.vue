<!-- HTML -->
<template>
  <div class="hello">
    <h1><css-cube></css-cube>{{ msg }}</h1>
  </div>
</template>

<!-- JS -->
<script>

import CssCube from './CssCube.vue';

export default {
	components: {CssCube},
	data() {
		return {
			msg: 'Hello World!'
		};
	}
};

</script>

<!-- CSS -->
<style scoped>

h1 {
  color: #42b983;
}

</style>
