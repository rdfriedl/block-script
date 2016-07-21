import VoxelBlock from './voxel/VoxelBlock.js';
import THREE from 'three';

/**
 * @module blocks
 */

const loader = new THREE.TextureLoader();

function basicMaterial(url,props,texProps){
	if(!url){
		console.trace('tried to create block material without texture url');
		return new THREE.MeshNormalMaterial();
	}

	let mat = new THREE.MeshLambertMaterial({
		reflectivity: 0,
		map: loader.load(url, tex => {
			tex.magFilter = THREE.NearestFilter;
			tex.minFilter = THREE.LinearMipMapLinearFilter;

			if(texProps){
		        //set the prop
		        for(let i in texProps){
		        	tex[i] = texProps[i];
		        }
			}

			tex.needsUpdate = true;
			mat.needsUpdate = true;
		})
	});

	if(props){
        //set the prop
        for(let i in props){
        	mat[i] = props[i];
        }
	}

	return mat;
}

/**
 * @class a block that changed based on the time axis
 * @name TimeBlock
 * @extends {VoxelBlock}
 */
class TimeBlock extends VoxelBlock{
	get material(){
		let TIMES = this.constructor.TIMES || [];

		//create cache
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		let time = this.properties.time;
		let cache = this.constructor._materialCache;
		if(Array.isArray(TIMES[time])){
			// let index = Math.floor(Math.random() * TIMES[time].length);
			let index = 0;

			// create cache
			if(!cache[time])
				cache[time] = [];

			// create material
			if(!cache[time][index])
				cache[time][index] = basicMaterial(TIMES[time][index]);

			return cache[time][index];
		}
		else{
			// create material
			if(!cache[time])
				cache[time] = basicMaterial(TIMES[time]);

			return cache[time];
		}
	}
	CreateMaterial(time){
		let TIMES = this.constructor.TIMES;
		if(TIMES)
			return basicMaterial(TIMES[time] || TIMES[0]);
	}
}
TimeBlock.DefalutProperties = {
	time: 0
}

/**
 * @class UID "dirt"
 * @name Dirt
 * @extends {VoxelBlock}
 */
export class Dirt extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/blocks/dirt.png'));
	}
}
Dirt.UID = 'dirt';

/**
 * @class UID "stone"
 * @name Stone
 * @extends {TimeBlock}
 */
export class Stone extends TimeBlock{}
Stone.UID = 'stone';
Stone.TIMES = [
	require('../res/blocks/stone/time-1.png'),
	require('../res/blocks/stone/time-2.png'),
	require('../res/blocks/stone/time-3.png'),
	require('../res/blocks/stone/time-4.png'),
	require('../res/blocks/stone/time-5.png'),
];

/**
 * @class UID "bricks-large"
 * @name BricksLarge
 * @extends {TimeBlock}
 */
export class BricksLarge extends TimeBlock {}
BricksLarge.UID = 'bricks-large';
BricksLarge.TIMES = [
	[
		require('../res/blocks/bricks-large/time-1-1.png'),
		require('../res/blocks/bricks-large/time-1-2.png'),
		require('../res/blocks/bricks-large/time-1-3.png'),
		require('../res/blocks/bricks-large/time-1-4.png'),
		require('../res/blocks/bricks-large/time-1-5.png')
	],
	require('../res/blocks/bricks-large/time-2.png'),
	require('../res/blocks/bricks-large/time-3-1.png'),
	require('../res/blocks/bricks-large/time-4.png'),
	require('../res/blocks/bricks-large/time-5-1.png')
];

/**
 * @class UID "bricks"
 * @name Bricks
 * @extends {TimeBlock}
 */
export class Bricks extends TimeBlock {}
Bricks.UID = 'bricks';
Bricks.TIMES = [
	require('../res/blocks/bricks/time-1.png'),
	require('../res/blocks/bricks/time-2.png'),
	require('../res/blocks/bricks/time-3.png'),
	require('../res/blocks/bricks/time-4.png'),
	require('../res/blocks/bricks/time-5.png')
];

/**
 * @class UID "tiles"
 * @name Tiles
 * @extends {TimeBlock}
 */
export class Tiles extends TimeBlock {}
Tiles.UID = 'tiles';
Tiles.TIMES = [
	require('../res/blocks/tiles/time-1.png'),
	require('../res/blocks/tiles/time-2.png'),
	require('../res/blocks/tiles/time-3.png'),
	require('../res/blocks/tiles/time-4.png'),
	require('../res/blocks/tiles/time-5.png')
];

/**
 * @class UID "tiles-large"
 * @name TilesLarge
 * @extends {TimeBlock}
 */
export class TilesLarge extends TimeBlock {}
TilesLarge.UID = 'tiles-large';
TilesLarge.TIMES = [
	[
		require('../res/blocks/tiles-large/time-1-1.png'),
		require('../res/blocks/tiles-large/time-1-2.png')
	],
	require('../res/blocks/tiles-large/time-2.png'),
	require('../res/blocks/tiles-large/time-3.png'),
	require('../res/blocks/tiles-large/time-4.png'),
	require('../res/blocks/tiles-large/time-5.png')
];

/**
 * @class UID "tiles-detail"
 * @name TilesDetail
 * @extends {TimeBlock}
 */
export class TilesDetail extends TimeBlock {}
TilesDetail.UID = 'tiles-detail';
TilesDetail.TIMES = [
	require('../res/blocks/tiles-detail/time-1.png'),
	require('../res/blocks/tiles-detail/time-2.png'),
	[
		require('../res/blocks/tiles-detail/time-3-1.png'),
		require('../res/blocks/tiles-detail/time-3-2.png')
	],
	require('../res/blocks/tiles-detail/time-4.png'),
	[
		require('../res/blocks/tiles-detail/time-5-1.png'),
		require('../res/blocks/tiles-detail/time-5-2.png'),
		require('../res/blocks/tiles-detail/time-5-3.png')
	]
];

// let LOG_TYPES = {
// 	normal: [require('../res/img/blocks/log_oak.png'), require('../res/img/blocks/log_oak_top.png')],
// 	birch: [require('../res/img/blocks/log_birch.png'), require('../res/img/blocks/log_birch_top.png')],
// 	jungle: [require('../res/img/blocks/log_jungle.png'), require('../res/img/blocks/log_jungle_top.png')],
// 	spruce: [require('../res/img/blocks/log_spruce.png'), require('../res/img/blocks/log_spruce_top.png')],
// 	big_oak: [require('../res/img/blocks/log_big_oak.png'), require('../res/img/blocks/log_big_oak_top.png')]
// }
// /**
//  * @class UID "log"
//  * @name Log
//  * @extends {VoxelBlock}
//  */
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
// 		let mat = new THREE.MultiMaterial([
// 			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][0] : LOG_TYPES['normal'][0]),
// 			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][1] : LOG_TYPES['normal'][1])
// 		]);
// 		return mat;
// 	}
// }
// Log.UID = 'log';
// Log.DefalutProperties = {
// 	type: 'normal',
// 	TYPES: Reflect.ownKeys(LOG_TYPES)
// }

/**
 * @class UID "wood"
 * @name Wood
 * @extends {TimeBlock}
 */
export class Planks extends TimeBlock{}
Planks.UID = 'planks';
Planks.TIMES = [
	require('../res/blocks/planks/time-1-1.png'),
	require('../res/blocks/planks/time-2.png'),
	require('../res/blocks/planks/time-3.png'),
	require('../res/blocks/planks/time-4.png'),
	require('../res/blocks/planks/time-5.png')
]
