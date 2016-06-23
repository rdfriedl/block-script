<!-- HTML -->
<template>

<div class="col-xs-12">
	<div class="page-header">
		<h1>load map: {{$route.params.mapID}}</h1>
	</div>
	<a class="btn btn-md btn-info" v-link="'/maps'"><i class="fa fa-arrow-left"></i> Back</a>
	<a href="http://threejs.org" class="btn btn-info" target="_blank">Three.js {{version}}</a>
</div>

</template>

<!-- JS -->
<script>

import THREE from 'three';
// extentions
import 'imports?THREE=three!../lib/threejs/controls/PointerLockControls.js';
import 'imports?THREE=three!../lib/threejs/loaders/ColladaLoader.js';

export default {
	data() {
		return {
			version: 'r'+THREE.REVISION
		};
	}
}

</script>
