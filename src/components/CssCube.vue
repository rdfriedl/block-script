<!-- HTML -->
<template>

<div class="cube">
	<div class="_3dbox">
		<div class="_3dface front" :style="{background: `url(${front || side || defaultImage})`, backgroundSize: '100%'}"></div>
		<div class="_3dface top" :style="{background: `url(${top || bottom || side || defaultImage})`, backgroundSize: '100%'}"></div>
		<div class="_3dface bottom" :style="{background: `url(${bottom || top || side || defaultImage})`, backgroundSize: '100%'}"></div>
		<div class="_3dface left" :style="{background: `url(${left || side || defaultImage})`, backgroundSize: '100%'}"></div>
		<div class="_3dface right" :style="{background: `url(${right || side || defaultImage})`, backgroundSize: '100%'}"></div>
		<div class="_3dface back" :style="{background: `url(${back || side || defaultImage})`, backgroundSize: '100%'}"></div>
	</div>
</div>

</template>

<!-- JS -->
<script>

export default {
	props: [
		'top',
		'bottom',
		'front',
		'back',
		'right',
		'left',
		'side'
	],
	data(){
		return {
			defaultImage: ''
		};
	}
}

</script>

<!-- CSS -->
<style scoped>

/*cube*/
.cube {
	width: 3em;
	height: 3em;
		text-align: center;
		display: inline-block;
}

._3dbox {
	display: inline-block;
	transition: all 0.5s;
	text-align: center;
	position: relative;
	width: 2em;
	height: 2em;
	top: .5em;
	transform-style: preserve-3d;
	transform: rotateX(-20deg) rotateY(45deg);
}

._3dface {
	overflow: hidden;
	position: absolute;
	width: 2em;
	height: 2em;
	background: #FFF;
	background-size: 100%;
	color: #333;
}

._3dface.front {
	transform: translate3d(0, 0, 1em);
}
._3dface.top {
	transform: rotateX(90deg) translate3d(0, 0, 1em);
}
._3dface.bottom {
	transform: rotateX(-90deg) translate3d(0, 0, 1em);
}
._3dface.left {
	left: 50%;
	margin-left: -50%;
	transform: rotateY(-90deg) translate3d(0, 0, 1em);
}
._3dface.right {
	left: 50%;
	margin-left: -50%;
	transform: rotateY(90deg) translate3d(0, 0, 1em);
}
._3dface.back {
	transform: rotateY(180deg) translate3d(0, 0, 1em);
}

.cube:hover ._3dbox{
	transform: rotateX(0deg) rotateY(0deg);
}

</style>
