<!-- HTML -->
<template>

<a href="http://threejs.org" class="btn btn-info" target="_blank">Three.js {{version}}</a>

</template>

<!-- JS -->
<script>

import ThreeJS from 'three';

export default {
	data() {
		return {
			version: 'r'+ThreeJS.REVISION
		};
	}
}

</script>
