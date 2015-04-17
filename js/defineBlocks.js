// solid block
var SolidBlock = Block.extend(function SolidBlock(){
	Block.prototype.constructor.apply(this,arguments);
},{
	material: blocks.nullMaterial,
	breakSound: ['wood1','wood2','wood3','wood4'],
	placeSound: ['wood1','wood2','wood3','wood4']
});

//collision block
var CollisionBlock = SolidBlock.extend(function CollisionBlock(){
	SolidBlock.prototype.constructor.apply(this,arguments);
},{
	_collision: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(settings.blockSize,settings.blockSize,settings.blockSize)),
		group: 'block'
	})
});
Object.defineProperties(CollisionBlock.prototype,{
	collision: {
		get: function(){
			var col = this._collision;
			col.position.copy(this.worldPosition.multiplyScalar(settings.blockSize));
			return col;
		}
	}
})

//blank
var Air = Block.extend(function Air(){
	Block.prototype.constructor.apply(this,arguments);
},{
	visible: false
}).add();

//dirt
var Dirt = CollisionBlock.extend(function Dirt(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('dirt.png'),
	breakSound: ['gravel1','gravel2','gravel3','gravel4'],
	placeSound: ['gravel1','gravel2','gravel3','gravel4']
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
			// blocks.util.basicMaterial('grass_top.png'),
			new THREE.MeshLambertMaterial({
				map: blocks.util.loadTexture('grass_top.png'),
				color: new THREE.Color(0x559944)
			}),
			blocks.util.basicMaterial('dirt.png')
		],
		[
			blocks.util.basicMaterial('grass_side.png'),
			blocks.util.basicMaterial('grass_side.png')
		],
	],
	breakSound: ['grass1','grass2','grass3','grass4'],
	placeSound: ['grass1','grass2','grass3','grass4']
}).add();

//stone
var Stone = CollisionBlock.extend(function Stone(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stone.png'),
	breakSound: ['stone1','stone2','stone3','stone4'],
	placeSound: ['stone1','stone2','stone3','stone4']
}).add();

//wood
var WoodPlanks = CollisionBlock.extend(function WoodPlanks(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('planks_oak.png'),
	breakSound: ['wood1','wood2','wood3','wood4'],
	placeSound: ['wood1','wood2','wood3','wood4']
}).add();