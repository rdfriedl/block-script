// solid block
var SolidBlock = Block.extend(function SolidBlock(){
	Block.prototype.constructor.apply(this,arguments);
},{
	material: blocks.nullMaterial,
});

//blank
var Air = Block.extend(function Air(){
	Block.prototype.constructor.apply(this,arguments);
},{
	visible: false
}).add();

//dirt
var Dirt = SolidBlock.extend(function Dirt(){
	SolidBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('dirt.png')
}).add();

//stone
var Stone = SolidBlock.extend(function Stone(){
	SolidBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stone_andesite.png')
}).add();

//grass
var Grass = SolidBlock.extend(function Grass(){
	SolidBlock.prototype.constructor.apply(this,arguments);
},{
	material: [ //x,y,z | +/-
		[
			blocks.util.basicMaterial('grass_side.png'),
			blocks.util.basicMaterial('grass_side.png')
		],
		[
			// blocks.util.basicMaterial('grass_top.png'),
			new THREE.MeshLambertMaterial({
				map: blocks.util.loadTexture('grass_top.png'),
				color: new THREE.Color(0x449966)
			}),
			blocks.util.basicMaterial('dirt.png')
		],
		[
			blocks.util.basicMaterial('grass_side.png'),
			blocks.util.basicMaterial('grass_side.png')
		],
	]
}).add();