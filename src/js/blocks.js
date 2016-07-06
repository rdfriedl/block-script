import VoxelBlock from './voxel/VoxelBlock.js';
import THREE from 'three';

/**
 * @module blocks
 */

const loader = new THREE.TextureLoader();

function basicMaterial(url,props,texProps){
	let mat = new THREE.MeshLambertMaterial({
		// color: '#694029',
		reflectivity: 0
	});

	if(props){
        //set the prop
        for(let i in props){
        	mat[i] = props[i];
        }
	}

	loader.load(url, tex => {
		mat.map = tex;
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.LinearMipMapLinearFilter;

		if(texProps){
	        //set the prop
	        for(let i in texProps){
	        	tex[i] = texProps[i];
	        }
		}
		mat.needsUpdate = true;
	})
	return mat;
}

/**
 * @class UID dirt
 * @name Dirt
 * @extends {VoxelBlock}
 */
export class Dirt extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/dirt.png'));
	}
}
Dirt.UID = 'dirt';
Dirt.defalutProperties = {
	newProp: true
}

window.VoxelBlock = VoxelBlock;
window.Dirt = Dirt;

/**
 * @class UID top_dirt
 * @name TopDirt
 * @extends {VoxelBlock}
 */
export class TopDirt extends VoxelBlock{
	CreateGeometry(){
		let geo = new THREE.BoxGeometry(1,1,1);
		geo.faces.forEach(face => {
			if(face.normal.y == 1)
				face.materialIndex = 2; //top
			else if(face.normal.y == -1)
				face.materialIndex = 1; //bottom
			else
				face.materialIndex = 0; //side
		});
		return geo;
	}
	CreateMaterial(){
		let mat = new THREE.MultiMaterial([
			basicMaterial(require('../res/img/blocks/grass_side.png')),
			basicMaterial(require('../res/img/blocks/dirt.png')),
			basicMaterial(require('../res/img/blocks/grass_top.png'))
		]);
		return mat;
	}
}
TopDirt.UID = 'top_dirt';

/**
 * @class UID stone
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
 * @class UID grass
 * @name Grass
 * @extends {VoxelBlock}
 */
export class Grass extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/grass_top.png'));
	}
}
Grass.UID = 'grass';

/**
 * @class UID brick
 * @name Brick
 * @extends {VoxelBlock}
 */
export class Brick extends VoxelBlock {
	CreateMaterial(){
		return basicMaterial(require("../res/img/blocks/brick.png"));
	}
}
Brick.UID = 'brick';

/**
 * @class UID gravel
 * @name Gravel
 * @extends {VoxelBlock}
 */
export class Gravel extends VoxelBlock {
	CreateMaterial(){
		return basicMaterial(require("../res/img/blocks/gravel.png"));
	}
}
Gravel.UID = 'gravel';

const GLASS_TYPE = [
	'black',
	'blue',
	'brown',
	'cyan',
	'gray',
	'green',
	'light_blue',
	'lime',
	'magenta',
	'orange',
	'pink',
	'purple',
	'red',
	'silver',
	'white',
	'yellow'
]
/**
 * @class UID glass
 * @name Glass
 * @extends {VoxelBlock}
 */
export class Glass extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require("../res/img/blocks/glass.png"),{
			transparent: true,
		})
	}
	UpdateProps(){

	}
}
Glass.UID = 'glass';
Glass.prototype.properties = {
	transparent: true,
	glass_type: 'normal'
}

//clay
let clayColors = [
	'black',
	'blue',
	'brown',
	'cyan',
	'gray',
	'green',
	'light_blue',
	'lime',
	'magenta',
	'orange',
	'pink',
	'purple',
	'red',
	'silver',
	'white',
	'yellow'
];

/**
 * @class
 * @name Clay
 * @extends {VoxelBlock}
 */
export class Clay extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require("../res/img/blocks/hardened_clay.png"),{
			transparent: true,
		})
	}
}
Clay.UID = 'clay';

// export class Iron extends VoxelBlock
