import VoxelBlock from './voxel/VoxelBlock.js';
import THREE from 'three';

/**
 * @module blocks
 */

const loader = new THREE.TextureLoader();

function basicMaterial(url,props,texProps){
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
 * @class UID "dirt"
 * @name Dirt
 * @extends {VoxelBlock}
 */
export class Dirt extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/dirt.png'));
	}
}
Dirt.UID = 'dirt';

/**
 * @class UID "stone"
 * @name Stone
 * @extends {VoxelBlock}
 */
export class Stone extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/stone.png'));
	}
}
Stone.UID = 'stone';

/**
 * @class UID "bedrock"
 * @name BedRock
 * @extends {VoxelBlock}
 */
export class BedRock extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/bedrock.png'));
	}
}
BedRock.UID = 'bedrock';

let BRICK_TYPES = {
	normal: require('../res/img/blocks/brick.png'),
	white: require('../res/img/blocks/bricks_white.png'),
	off_white: require('../res/img/blocks/bricks_off_white.png'),
	tan: require('../res/img/blocks/bricks_tan.png')
}
/**
 * @class UID "brick"
 * @name Brick
 * @extends {VoxelBlock}
 */
export class Brick extends VoxelBlock {
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(BRICK_TYPES[type] || BRICK_TYPES['normal'])
	}
}
Brick.UID = 'brick';
Brick.prototype.properties = {
	type: 'normal',
	TYPES: Reflect.ownKeys(BRICK_TYPES)
}

let TILE_TYPES = {
	normal: require('../res/img/blocks/tile_normal.png'),
	normal_inner: require('../res/img/blocks/tile_normal_inner.png'),
	off_white: require('../res/img/blocks/tile_off_white.png'),
	off_white_inner: require('../res/img/blocks/tile_off_white_inner.png'),
	white: require('../res/img/blocks/tile_white.png'),
	white_inner: require('../res/img/blocks/tile_white_inner.png'),
	diagonal: require('../res/img/blocks/tiles_diagonal.png')
}
/**
 * @class UID "tile"
 * @name Tile
 * @extends {VoxelBlock}
 */
export class Tile extends VoxelBlock {
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(TILE_TYPES[type] || TILE_TYPES['normal'])
	}
}
Tile.UID = 'tile';
Tile.prototype.properties = {
	type: 'normal',
	TYPES: Reflect.ownKeys(TILE_TYPES)
}

/**
 * @class UID "gravel"
 * @name Gravel
 * @extends {VoxelBlock}
 */
export class Gravel extends VoxelBlock {
	CreateMaterial(){
		return basicMaterial(require("../res/img/blocks/gravel.png"));
	}
}
Gravel.UID = 'gravel';

let LOG_TYPES = {
	normal: [require('../res/img/blocks/log_oak.png'), require('../res/img/blocks/log_oak_top.png')],
	birch: [require('../res/img/blocks/log_birch.png'), require('../res/img/blocks/log_birch_top.png')],
	jungle: [require('../res/img/blocks/log_jungle.png'), require('../res/img/blocks/log_jungle_top.png')],
	spruce: [require('../res/img/blocks/log_spruce.png'), require('../res/img/blocks/log_spruce_top.png')],
	big_oak: [require('../res/img/blocks/log_big_oak.png'), require('../res/img/blocks/log_big_oak_top.png')]
}
/**
 * @class UID "log"
 * @name Log
 * @extends {VoxelBlock}
 */
export class Log extends VoxelBlock{
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateGeometry(){
		let geo = new THREE.BoxGeometry(1,1,1);
		geo.faces.forEach(face => {
			if(face.normal.y)
				face.materialIndex = 1; //top / bottom
			else
				face.materialIndex = 0; //side
		});
		return geo;
	}
	CreateMaterial(type){
		let mat = new THREE.MultiMaterial([
			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][0] : LOG_TYPES['normal'][0]),
			basicMaterial(LOG_TYPES[type]? LOG_TYPES[type][1] : LOG_TYPES['normal'][1])
		]);
		return mat;
	}
}
Log.UID = 'log';
Log.prototype.properties = {
	type: 'normal',
	TYPES: Reflect.ownKeys(LOG_TYPES)
}

let WOOD_TYPES = {
	normal: require('../res/img/blocks/planks_oak.png'),
	birch: require('../res/img/blocks/planks_birch.png'),
	spruce: require('../res/img/blocks/planks_spruce.png'),
	acacia: require('../res/img/blocks/planks_acacia.png'),
	jungle: require('../res/img/blocks/planks_jungle.png'),
	spruce: require('../res/img/blocks/planks_spruce.png'),
	big_oak: require('../res/img/blocks/planks_big_oak.png')
}
/**
 * @class UID "wood"
 * @name Wood
 * @extends {VoxelBlock}
 */
export class Wood extends VoxelBlock{
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(WOOD_TYPES[type] || WOOD_TYPES['normal']);
	}
}
Wood.UID = 'wood';
Wood.prototype.properties = {
	type: 'normal',
	TYPES: Reflect.ownKeys(WOOD_TYPES)
}

/**
 * @class UID "hay"
 * @name Hay
 * @extends {VoxelBlock}
 */
export class Hay extends VoxelBlock{
	CreateGeometry(){
		let geo = new THREE.BoxGeometry(1,1,1);
		geo.faces.forEach(face => {
			if(face.normal.y)
				face.materialIndex = 1; //top / bottom
			else
				face.materialIndex = 0; //side
		});
		return geo;
	}
	CreateMaterial(type){
		let mat = new THREE.MultiMaterial([
			basicMaterial(require('../res/img/blocks/hay_block_side.png')),
			basicMaterial(require('../res/img/blocks/hay_block_top.png'))
		]);
		return mat;
	}
}
Hay.UID = 'hay';

/**
 * @class UID "end-stone"
 * @name ENDStone
 * @extends {VoxelBlock}
 */
export class ENDStone extends VoxelBlock{
	CreateMaterial(type){
		return basicMaterial(require('../res/img/blocks/end_stone.png'));
	}
}
ENDStone.UID = 'end-stone';

/**
 * @class UID "obsidian"
 * @name Obsidian
 * @extends {VoxelBlock}
 */
export class Obsidian extends VoxelBlock{
	CreateMaterial(type){
		return basicMaterial(require('../res/img/blocks/obsidian.png'));
	}
}
Obsidian.UID = 'obsidian';

/**
 * @class UID "end-stone-pillar"
 * @name EndStonePillar
 * @extends {VoxelBlock}
 */
export class EndStonePillar extends VoxelBlock{
	CreateGeometry(){
		let geo = new THREE.BoxGeometry(1,1,1);
		geo.faces.forEach(face => {
			if(face.normal.y)
				face.materialIndex = 1; //top / bottom
			else
				face.materialIndex = 0; //side
		});
		return geo;
	}
	CreateMaterial(type){
		let mat = new THREE.MultiMaterial([
			basicMaterial(require('../res/img/blocks/dark_endstone_brick_pillar.png')),
			basicMaterial(require('../res/img/blocks/dark_endstone_brick_carved.png'))
		]);
		return mat;
	}
}
EndStonePillar.UID = 'end-stone-pillar';

let GLASS_TYPES = {
	normal: require('../res/img/blocks/glass.png'),
	black: require('../res/img/blocks/glass_black.png'),
	blue: require('../res/img/blocks/glass_blue.png'),
	brown: require('../res/img/blocks/glass_brown.png'),
	cyan: require('../res/img/blocks/glass_cyan.png'),
	gray: require('../res/img/blocks/glass_gray.png'),
	green: require('../res/img/blocks/glass_green.png'),
	light_blue: require('../res/img/blocks/glass_light_blue.png'),
	lime: require('../res/img/blocks/glass_lime.png'),
	magenta: require('../res/img/blocks/glass_magenta.png'),
	orange: require('../res/img/blocks/glass_orange.png'),
	pink: require('../res/img/blocks/glass_pink.png'),
	purple: require('../res/img/blocks/glass_purple.png'),
	red: require('../res/img/blocks/glass_red.png'),
	silver: require('../res/img/blocks/glass_silver.png'),
	white: require('../res/img/blocks/glass_white.png'),
	yellow: require('../res/img/blocks/glass_yellow.png'),
};

/**
 * @class UID "glass"
 * @name Glass
 * @extends {VoxelBlock}
 */
export class Glass extends VoxelBlock{
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(GLASS_TYPES[type] || GLASS_TYPES['normal'],{
			transparent: true,
		})
	}
}
Glass.UID = 'glass';
Glass.prototype.properties = {
	transparent: true,
	type: 'normal',
	TYPES: Reflect.ownKeys(GLASS_TYPES)
}

let CLAY_TYPES = {
	normal: require('../res/img/blocks/hardened_clay.png'),
	black: require('../res/img/blocks/hardened_clay_stained_black.png'),
	blue: require('../res/img/blocks/hardened_clay_stained_blue.png'),
	brown: require('../res/img/blocks/hardened_clay_stained_brown.png'),
	cyan: require('../res/img/blocks/hardened_clay_stained_cyan.png'),
	gray: require('../res/img/blocks/hardened_clay_stained_gray.png'),
	green: require('../res/img/blocks/hardened_clay_stained_green.png'),
	light_blue: require('../res/img/blocks/hardened_clay_stained_light_blue.png'),
	lime: require('../res/img/blocks/hardened_clay_stained_lime.png'),
	magenta: require('../res/img/blocks/hardened_clay_stained_magenta.png'),
	orange: require('../res/img/blocks/hardened_clay_stained_orange.png'),
	pink: require('../res/img/blocks/hardened_clay_stained_pink.png'),
	purple: require('../res/img/blocks/hardened_clay_stained_purple.png'),
	red: require('../res/img/blocks/hardened_clay_stained_red.png'),
	silver: require('../res/img/blocks/hardened_clay_stained_silver.png'),
	white: require('../res/img/blocks/hardened_clay_stained_white.png'),
	yellow: require('../res/img/blocks/hardened_clay_stained_yellow.png')
}
/**
 * @class
 * @name Clay
 * @extends {VoxelBlock}
 */
export class Clay extends VoxelBlock{
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(CLAY_TYPES[type] || CLAY_TYPES['normal'])
	}
}
Clay.UID = 'clay';
Clay.prototype.properties = {
	type: 'normal',
	TYPES: Reflect.ownKeys(CLAY_TYPES)
}

let WOOL_TYPES = {
	black: require('../res/img/blocks/wool_colored_black.png'),
	blue: require('../res/img/blocks/wool_colored_blue.png'),
	brown: require('../res/img/blocks/wool_colored_brown.png'),
	cyan: require('../res/img/blocks/wool_colored_cyan.png'),
	gray: require('../res/img/blocks/wool_colored_gray.png'),
	green: require('../res/img/blocks/wool_colored_green.png'),
	light_blue: require('../res/img/blocks/wool_colored_light_blue.png'),
	lime: require('../res/img/blocks/wool_colored_lime.png'),
	magenta: require('../res/img/blocks/wool_colored_magenta.png'),
	orange: require('../res/img/blocks/wool_colored_orange.png'),
	pink: require('../res/img/blocks/wool_colored_pink.png'),
	purple: require('../res/img/blocks/wool_colored_purple.png'),
	red: require('../res/img/blocks/wool_colored_red.png'),
	silver: require('../res/img/blocks/wool_colored_silver.png'),
	white: require('../res/img/blocks/wool_colored_white.png'),
	yellow: require('../res/img/blocks/wool_colored_yellow.png')
};

/**
 * @class UID "wool"
 * @name Wool
 * @extends {VoxelBlock}
 */
export class Wool extends VoxelBlock{
	get material(){
		if(!this.constructor._materialCache)
			this.constructor._materialCache = {};

		if(!this.constructor._materialCache[this.properties.type]){
			//create it
			this.constructor._materialCache[this.properties.type] = this.CreateMaterial(this.properties.type);
		}
		return this.constructor._materialCache[this.properties.type];
	}
	CreateMaterial(type){
		return basicMaterial(WOOL_TYPES[type] || WOOL_TYPES['normal'])
	}
}
Wool.UID = 'wool';
Wool.prototype.properties = {
	type: 'white',
	TYPES: Reflect.ownKeys(WOOL_TYPES)
}
