// solid block
var SolidBlock = Block.extend(function SolidBlock(){
	Block.prototype.constructor.apply(this,arguments);
},{
	material: blocks.nullMaterial,
});

//collision block
var CollisionBlock = SolidBlock.extend(function CollisionBlock(){
	SolidBlock.prototype.constructor.apply(this,arguments);
},{
	_collision: new CollisionEntity({
		box: new THREE.Box3(new THREE.Vector3(-0.1,-0.1,-0.1), new THREE.Vector3(map.blockSize,map.blockSize,map.blockSize)),
		group: 'block'
	})
});
Object.defineProperties(CollisionBlock.prototype,{
	collision: {
		get: function(){
			var col = this._collision;
			col.position.copy(this.worldPosition.multiplyScalar(map.blockSize));
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
	material: blocks.util.basicMaterial('dirt.png')
}).add();

//stone
var Stone = CollisionBlock.extend(function Stone(){
	CollisionBlock.prototype.constructor.apply(this,arguments);
},{
	material: blocks.util.basicMaterial('stone.png')
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
	]
}).add();