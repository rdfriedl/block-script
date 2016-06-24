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
 * @class
 * @name DirtBlock
 * @extends {VoxelBlock}
 */
export class DirtBlock extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/dirt.png'));
	}
}
DirtBlock.UID = 'dirt';

/**
 * @class
 * @name StoneBlock
 * @extends {VoxelBlock}
 */
export class StoneBlock extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/stone.png'));
	}
}
StoneBlock.UID = 'stone';

/**
 * @class
 * @name GrassBlock
 * @extends {VoxelBlock}
 */
export class GrassBlock extends VoxelBlock{
	CreateMaterial(){
		return basicMaterial(require('../res/img/blocks/grass_top.png'));
	}
}
GrassBlock.UID = 'grass';
