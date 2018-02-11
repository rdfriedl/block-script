import VoxelBlock from "../voxel/VoxelBlock.js";
import * as THREE from "three";

const loader = new THREE.TextureLoader();

function pixelate(tex) {
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.LinearMipMapLinearFilter;
	return tex;
}

function basicMaterial(url, props, texProps) {
	if (!url) {
		console.trace("tried to create block material without texture url");
		return new THREE.MeshNormalMaterial();
	}

	let mat = new THREE.MeshPhongMaterial({
		shininess: 0,
		map: loader.load(url, tex => {
			tex.magFilter = THREE.NearestFilter;
			tex.minFilter = THREE.LinearMipMapLinearFilter;

			if (texProps) {
				// set the prop
				for (let i in texProps) {
					tex[i] = texProps[i];
				}
			}
		}),
	});

	if (props) {
		// set the prop
		for (let i in props) {
			mat[i] = props[i];
		}
	}

	return mat;
}

/** a block that changed based on the time axis */
export class TimeBlock extends VoxelBlock {
	get material() {
		let TIMES = this.constructor.TIMES || [];

		// create cache
		if (!this.constructor._materialCache) this.constructor._materialCache = {};

		let time = (this.map && this.map.time) || (this.parent && this.parent.time) || 0;
		let cache = this.constructor._materialCache;
		if (Array.isArray(TIMES[time])) {
			// let index = Math.floor(Math.random() * TIMES[time].length);
			let index = 0;

			// create cache
			if (!cache[time]) cache[time] = [];

			// create material
			if (!cache[time][index]) cache[time][index] = this.CreateMaterial(TIMES[time][index]);

			return cache[time][index];
		} else {
			// create material
			if (!cache[time]) cache[time] = this.CreateMaterial(TIMES[time]);

			return cache[time];
		}
	}
	CreateMaterial(time) {
		if (!time) return;

		if (typeof time === "string") {
			return new THREE.MeshPhongMaterial({
				shininess: 0,
				map: loader.load(time, pixelate),
			});
		} else if (typeof time === "object") {
			let mat = {
				shininess: 0,
			};

			// copy props
			for (let i in time) mat[i] = time[i];

			// load texture if its a string
			if (typeof time.map === "string") mat.map = loader.load(time.map, pixelate);

			// load bump map if its a string
			if (typeof time.bumpMap === "string") mat.bumpMap = loader.load(time.bumpMap);

			return new THREE.MeshPhongMaterial(mat);
		}
	}
}

export class Dirt extends VoxelBlock {
	/** @return {THREE.Geometry} */
	CreateMaterial() {
		return new THREE.MeshPhongMaterial({
			shininess: 0,
			map: loader.load(require("../res/blocks/dirt.png"), pixelate),
			bumpMap: loader.load(require("../res/blocks/dirt-bump.png")),
		});
	}
}
Dirt.UID = "dirt";

export class Stone extends TimeBlock {}
Stone.UID = "stone";
Stone.TIMES = [
	require("../res/blocks/stone/time-1.png"),
	{
		map: require("../res/blocks/stone/time-2.png"),
		bumpMap: require("../res/blocks/stone/time-2-5-bump.png"),
	},
	require("../res/blocks/stone/time-3.png"),
	{
		map: require("../res/blocks/stone/time-4.png"),
		bumpMap: require("../res/blocks/stone/time-4-bump.png"),
	},
	{
		map: require("../res/blocks/stone/time-5.png"),
		bumpMap: require("../res/blocks/stone/time-2-5-bump.png"),
	},
];

export class BricksLarge extends TimeBlock {}
BricksLarge.UID = "bricks-large";
BricksLarge.TIMES = [
	[
		require("../res/blocks/bricks-large/time-1-1.png"),
		require("../res/blocks/bricks-large/time-1-2.png"),
		require("../res/blocks/bricks-large/time-1-3.png"),
		require("../res/blocks/bricks-large/time-1-4.png"),
		require("../res/blocks/bricks-large/time-1-5.png"),
	],
	{
		map: require("../res/blocks/bricks-large/time-2.png"),
		bumpMap: require("../res/blocks/bricks-large/time-2-bump.png"),
	},
	{
		map: require("../res/blocks/bricks-large/time-3-1.png"),
		bumpMap: require("../res/blocks/bricks-large/time-3-1-bump.png"),
	},
	{
		map: require("../res/blocks/bricks-large/time-4.png"),
		bumpMap: require("../res/blocks/bricks-large/time-4-bump.png"),
	},
	{
		map: require("../res/blocks/bricks-large/time-5-1.png"),
		bumpMap: require("../res/blocks/bricks-large/time-3-1-bump.png"),
	},
];

export class Bricks extends TimeBlock {}
Bricks.UID = "bricks";
Bricks.TIMES = [
	{
		map: require("../res/blocks/bricks/time-1.png"),
		bumpMap: require("../res/blocks/bricks/time-1-bump.png"),
	},
	{
		map: require("../res/blocks/bricks/time-2.png"),
		bumpMap: require("../res/blocks/bricks/time-2-5-bump.png"),
	},
	require("../res/blocks/bricks/time-3.png"),
	require("../res/blocks/bricks/time-4.png"),
	{
		map: require("../res/blocks/bricks/time-5.png"),
		bumpMap: require("../res/blocks/bricks/time-2-5-bump.png"),
	},
];

export class Tiles extends TimeBlock {}
Tiles.UID = "tiles";
Tiles.TIMES = [
	require("../res/blocks/tiles/time-1.png"),
	require("../res/blocks/tiles/time-2.png"),
	{
		map: require("../res/blocks/tiles/time-3.png"),
		bumpMap: require("../res/blocks/tiles/time-3-bump.png"),
	},
	require("../res/blocks/tiles/time-4.png"),
	require("../res/blocks/tiles/time-5.png"),
];

export class TilesLarge extends TimeBlock {}
TilesLarge.UID = "tiles-large";
TilesLarge.TIMES = [
	[
		{
			map: require("../res/blocks/tiles-large/time-1-1.png"),
			bumpMap: require("../res/blocks/tiles-large/bump.png"),
		},
		{
			map: require("../res/blocks/tiles-large/time-1-2.png"),
			bumpMap: require("../res/blocks/tiles-large/bump.png"),
		},
	],
	{
		map: require("../res/blocks/tiles-large/time-2.png"),
		bumpMap: require("../res/blocks/tiles-large/bump.png"),
	},
	{
		map: require("../res/blocks/tiles-large/time-3.png"),
		bumpMap: require("../res/blocks/tiles-large/bump.png"),
	},
	{
		map: require("../res/blocks/tiles-large/time-4.png"),
		bumpMap: require("../res/blocks/tiles-large/bump.png"),
	},
	{
		map: require("../res/blocks/tiles-large/time-5.png"),
		bumpMap: require("../res/blocks/tiles-large/bump.png"),
	},
];

export class TilesDetail extends TimeBlock {}
TilesDetail.UID = "tiles-detail";
TilesDetail.TIMES = [
	require("../res/blocks/tiles-detail/time-1.png"),
	require("../res/blocks/tiles-detail/time-2.png"),
	[require("../res/blocks/tiles-detail/time-3-1.png"), require("../res/blocks/tiles-detail/time-3-2.png")],
	require("../res/blocks/tiles-detail/time-4.png"),
	[
		require("../res/blocks/tiles-detail/time-5-1.png"),
		require("../res/blocks/tiles-detail/time-5-2.png"),
		require("../res/blocks/tiles-detail/time-5-3.png"),
	],
];

// let LOG_TYPES = {
// 	normal: [require('./res/img/blocks/log_oak.png'), require('./res/img/blocks/log_oak_top.png')],
// 	birch: [require('./res/img/blocks/log_birch.png'), require('./res/img/blocks/log_birch_top.png')],
// 	jungle: [require('./res/img/blocks/log_jungle.png'), require('./res/img/blocks/log_jungle_top.png')],
// 	spruce: [require('./res/img/blocks/log_spruce.png'), require('./res/img/blocks/log_spruce_top.png')],
// 	big_oak: [require('./res/img/blocks/log_big_oak.png'), require('./res/img/blocks/log_big_oak_top.png')]
// }
// export class Log extends VoxelBlock{
// 	get material(){
// 		if(!this.constructor._materialCache)
// 			this.constructor._materialCache = {};

// 		if(!this.constructor._materialCache[this.properties.type]){
// 			//create it
// 			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
// 		}
// 		return this.constructor._materialCache[this.properties.type];
// 	}
// 	CreateGeometry(){
// 		let geo = new THREE.BoxGeometry(1,1,1);
// 		geo.faces.forEach(face => {
// 			if(face.normal.y)
// 				face.materialIndex = 1; //top / bottom
// 			else
// 				face.materialIndex = 0; //side
// 		});
// 		return geo;
// 	}
// 	CreateMaterial(type){
// 		return [
// 			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][0] : LOG_TYPES['normal'][0]),
// 			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][1] : LOG_TYPES['normal'][1])
// 		];
// 	}
// }
// Log.UID = 'log';
// Log.DefaultProperties = {
// 	type: 'normal',
// 	TYPES: Reflect.ownKeys(LOG_TYPES)
// }

export class Planks extends TimeBlock {}
Planks.UID = "planks";
Planks.TIMES = [
	{
		map: require("../res/blocks/planks/time-1-1.png"),
		bumpMap: require("../res/blocks/planks/bump.png"),
	},
	{
		map: require("../res/blocks/planks/time-2.png"),
		bumpMap: require("../res/blocks/planks/bump.png"),
	},
	{
		map: require("../res/blocks/planks/time-3.png"),
		bumpMap: require("../res/blocks/planks/bump.png"),
	},
	{
		map: require("../res/blocks/planks/time-4.png"),
		bumpMap: require("../res/blocks/planks/bump.png"),
	},
	{
		map: require("../res/blocks/planks/time-5.png"),
		bumpMap: require("../res/blocks/planks/bump.png"),
	},
];
