(function(){

//air
var Air = Block.extend(function Air(){
	Block.prototype.constructor.apply(this,arguments);
}).add();

//dirt
var Dirt = CollisionBlock.extend(function Dirt(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('dirt.png'),
	removeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
	placeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
	stepSound: ['stepGravel1','stepGravel2','stepGravel3','stepGravel4']
}).add();

//grass
var Grass = CollisionBlock.extend(function Grass(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: [ //x,y,z | +/-
		[
			blocks.util.basicMaterial('grass_side.png'),
			blocks.util.basicMaterial('grass_side.png')
		],
		[
			blocks.util.basicMaterial('grass_top.png'),
			blocks.util.basicMaterial('dirt.png')
		],
		[
			blocks.util.basicMaterial('grass_side.png'),
			blocks.util.basicMaterial('grass_side.png')
		]
	],
	removeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
	placeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
	stepSound: ['stepGrass1','stepGrass2','stepGrass3','stepGrass4']
}).add();

//wood
var WoodPlanks = CollisionBlock.extend(function WoodPlanks(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	removeSound: ['digWood1','digWood2','digWood3','digWood4'],
	placeSound: ['digWood1','digWood2','digWood3','digWood4'],
	stepSound: ['stepWood1','stepWood2','stepWood3','stepWood4']
});

var WoodPlanksOak = WoodPlanks.extend(function WoodPlanksOak(){
	WoodPlanks.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('planks_oak.png'),
}).add();

var WoodPlanksBirch = WoodPlanks.extend(function WoodPlanksBirch(){
	WoodPlanks.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('planks_birch.png'),
}).add();

var WoodPlanksJungle = WoodPlanks.extend(function WoodPlanksJungle(){
	WoodPlanks.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('planks_jungle.png'),
}).add();

var WoodPlanksSpruce = WoodPlanks.extend(function WoodPlanksSpruce(){
	WoodPlanks.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('planks_spruce.png'),
}).add();

//log
var Log = CollisionBlock.extend(function Log(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	removeSound: ['digWood1','digWood2','digWood3','digWood4'],
	placeSound: ['digWood1','digWood2','digWood3','digWood4'],
	stepSound: ['stepWood1','stepWood2','stepWood3','stepWood4']
});

var LogOak = Log.extend(function LogOak(){
	Log.prototype.constructor.apply(this,arguments);
},{
	material: [
		[
			blocks.util.basicMaterial('log_oak.png'),
			blocks.util.basicMaterial('log_oak.png')
		],
		[
			blocks.util.basicMaterial('log_oak_top.png'),
			blocks.util.basicMaterial('log_oak_top.png')
		],
		[
			blocks.util.basicMaterial('log_oak.png'),
			blocks.util.basicMaterial('log_oak.png')
		]
	]
}).add();

var LogBirch = Log.extend(function LogBirch(){
	Log.prototype.constructor.apply(this,arguments);
},{
	material: [
		[
			blocks.util.basicMaterial('log_birch.png'),
			blocks.util.basicMaterial('log_birch.png')
		],
		[
			blocks.util.basicMaterial('log_birch_top.png'),
			blocks.util.basicMaterial('log_birch_top.png')
		],
		[
			blocks.util.basicMaterial('log_birch.png'),
			blocks.util.basicMaterial('log_birch.png')
		]
	]
}).add();

var LogJungle = Log.extend(function LogJungle(){
	Log.prototype.constructor.apply(this,arguments);
},{
	material: [
		[
			blocks.util.basicMaterial('log_jungle.png'),
			blocks.util.basicMaterial('log_jungle.png')
		],
		[
			blocks.util.basicMaterial('log_jungle_top.png'),
			blocks.util.basicMaterial('log_jungle_top.png')
		],
		[
			blocks.util.basicMaterial('log_jungle.png'),
			blocks.util.basicMaterial('log_jungle.png')
		]
	]
}).add();

var LogSpruce = Log.extend(function LogSpruce(){
	Log.prototype.constructor.apply(this,arguments);
},{
	material: [
		[
			blocks.util.basicMaterial('log_spruce.png'),
			blocks.util.basicMaterial('log_spruce.png')
		],
		[
			blocks.util.basicMaterial('log_spruce_top.png'),
			blocks.util.basicMaterial('log_spruce_top.png')
		],
		[
			blocks.util.basicMaterial('log_spruce.png'),
			blocks.util.basicMaterial('log_spruce.png')
		]
	]
}).add();

//stone
var Stone = CollisionBlock.extend(function Stone(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stone.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var StoneBrick = CollisionBlock.extend(function StoneBrick(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stonebrick.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var StoneBrickMossy = CollisionBlock.extend(function StoneBrickMossy(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stonebrick_mossy.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var Bricks = CollisionBlock.extend(function Bricks(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('brick.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var EndStone = CollisionBlock.extend(function EndStone(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('end_stone.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var AnvilBase = CollisionBlock.extend(function AnvilBase(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('anvil_base.png')
}).add();

var IronBrock = CollisionBlock.extend(function IronBrock(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('iron_block.png')
}).add();

var quartz = CollisionBlock.extend(function quartz(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('quartz_block_side.png'),
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var BookShelf = CollisionBlock.extend(function BookShelf(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: [
		[
			blocks.util.basicMaterial('bookshelf.png'),
			blocks.util.basicMaterial('bookshelf.png')
		],
		[
			blocks.util.basicMaterial('planks_oak.png'),
			blocks.util.basicMaterial('planks_oak.png')
		],
		[
			blocks.util.basicMaterial('bookshelf.png'),
			blocks.util.basicMaterial('bookshelf.png')
		]
	],
	removeSound: ['digWood1','digWood2','digWood3','digWood4'],
	placeSound: ['digWood1','digWood2','digWood3','digWood4'],
	stepSound: ['stepWood1','stepWood2','stepWood3','stepWood4']
}).add();

var SandStone = CollisionBlock.extend(function SandStone(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: [ //x,y,z | +/-
		[
			blocks.util.basicMaterial('sandstone_normal.png'),
			blocks.util.basicMaterial('sandstone_normal.png')
		],
		[
			blocks.util.basicMaterial('sandstone_top.png'),
			blocks.util.basicMaterial('sandstone_bottom.png')
		],
		[
			blocks.util.basicMaterial('sandstone_normal.png'),
			blocks.util.basicMaterial('sandstone_normal.png')
		]
	],
	removeSound: ['digStone1','digStone2','digStone3','digStone4'],
	placeSound: ['digStone1','digStone2','digStone3','digStone4'],
	stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4']
}).add();

var Hay = CollisionBlock.extend(function Hay(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: [ //x,y,z | +/-
		[
			blocks.util.basicMaterial('hay_block_side.png'),
			blocks.util.basicMaterial('hay_block_side.png')
		],
		[
			blocks.util.basicMaterial('hay_block_top.png'),
			blocks.util.basicMaterial('hay_block_top.png')
		],
		[
			blocks.util.basicMaterial('hay_block_side.png'),
			blocks.util.basicMaterial('hay_block_side.png')
		]
	],
	removeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
	placeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
	stepSound: ['stepGrass1','stepGrass2','stepGrass3','stepGrass4']
}).add();

//GrassMesh
var GrassMesh = XMeshBlock.extend(function GrassMesh(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('double_plant_grass_top.png')
}).add();

//flowers
var FlowerAllium = XMeshBlock.extend(function FlowerAllium(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_allium.png')
}).add();
var FlowerBlueOrchid = XMeshBlock.extend(function FlowerBlueOrchid(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_blue_orchid.png')
}).add();
var FlowerDandelion = XMeshBlock.extend(function FlowerDandelion(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_dandelion.png')
}).add();
var FlowerHoustonia = XMeshBlock.extend(function FlowerHoustonia(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_houstonia.png')
}).add();
var FlowerOxeyeDaisy = XMeshBlock.extend(function FlowerOxeyeDaisy(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_oxeye_daisy.png')
}).add();
var FlowerPaeonia = XMeshBlock.extend(function FlowerPaeonia(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_paeonia.png')
}).add();
var FlowerRose = XMeshBlock.extend(function FlowerRose(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_rose.png')
}).add();
var FlowerTulipOrange = XMeshBlock.extend(function FlowerTulipOrange(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_tulip_orange.png')
}).add();
var FlowerTulipPink = XMeshBlock.extend(function FlowerTulipPink(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_tulip_pink.png')
}).add();
var FlowerTulipRed = XMeshBlock.extend(function FlowerTulipRed(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_tulip_red.png')
}).add();
var FlowerTulipWhite = XMeshBlock.extend(function FlowerTulipWhite(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('flower_tulip_white.png')
}).add();
var MushroomRed = XMeshBlock.extend(function MushroomRed(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('mushroom_red.png')
}).add();
var MushroomBrown = XMeshBlock.extend(function MushroomBrown(){
	XMeshBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('mushroom_brown.png')
}).add();


})();