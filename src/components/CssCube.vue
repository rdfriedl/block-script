<!-- HTML -->
<template>

<div class="cube">
	<div class="_3dbox">
		<div class="_3dface front"></div>
		<div class="_3dface top"></div>
		<div class="_3dface bottom"></div>
		<div class="_3dface left"></div>
		<div class="_3dface right"></div>
		<div class="_3dface back"></div>
	</div>
</div>

</template>

<!-- NOTE: make images for the sides on the cube be arguments for this component -->

<!-- JS -->
<script>

export default {

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

/* config */
.cube .bottom{
	background: url('../res/img/blocks/dirt.png');
		background-size: 100%;
}
.cube .front, .cube .back, .cube .right, .cube .left{
	background: url('../res/img/blocks/grass_side.png');
		background-size: 100%;
}
.cube .top{
		background: linear-gradient(
				rgba(85, 153, 68, 0.6),
				rgba(85, 153, 68, 0.6)
		), url('../res/img/blocks/grass_top.png');
		background-size: 100%;
}

.cube:hover ._3dbox{
	transform: rotateX(0deg) rotateY(0deg);
}

</style>
