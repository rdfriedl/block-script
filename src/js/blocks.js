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
	UpdateParameters(){

	}
}
Glass.UID = 'glass';
Glass.prototype.parameters = Object.create(Glass.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_black
 * @name Glass_Black
 * @extends {module:blocks~Glass}
 * */
export class Glass_Black extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_black.png'),{transparent: true})}};
Glass_Black.UID = 'glass_black';
Glass_Black.prototype.parameters = Object.create(Glass_Black.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_blue
 * @name Glass_Blue
 * @extends {module:blocks~Glass}
 * */
export class Glass_Blue extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_blue.png'),{transparent: true})}};
Glass_Blue.UID = 'glass_blue';
Glass_Blue.prototype.parameters = Object.create(Glass_Blue.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_brown
 * @name Glass_Brown
 * @extends {module:blocks~Glass}
 * */
export class Glass_Brown extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_brown.png'),{transparent: true})}};
Glass_Brown.UID = 'glass_brown';
Glass_Brown.prototype.parameters = Object.create(Glass_Brown.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_cyan
 * @name Glass_Cyan
 * @extends {module:blocks~Glass}
 * */
export class Glass_Cyan extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_cyan.png'),{transparent: true})}};
Glass_Cyan.UID = 'glass_cyan';
Glass_Cyan.prototype.parameters = Object.create(Glass_Cyan.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_gray
 * @name Glass_Gray
 * @extends {module:blocks~Glass}
 * */
export class Glass_Gray extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_gray.png'),{transparent: true})}};
Glass_Gray.UID = 'glass_gray';
Glass_Gray.prototype.parameters = Object.create(Glass_Gray.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_green
 * @name Glass_Green
 * @extends {module:blocks~Glass}
 * */
export class Glass_Green extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_green.png'),{transparent: true})}};
Glass_Green.UID = 'glass_green';
Glass_Green.prototype.parameters = Object.create(Glass_Green.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_light_blue
 * @name Glass_Light_Blue
 * @extends {module:blocks~Glass}
 * */
export class Glass_Light_Blue extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_light_blue.png'),{transparent: true})}};
Glass_Light_Blue.UID = 'glass_light_blue';
Glass_Light_Blue.prototype.parameters = Object.create(Glass_Light_Blue.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_lime
 * @name Glass_Lime
 * @extends {module:blocks~Glass}
 * */
export class Glass_Lime extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_lime.png'),{transparent: true})}};
Glass_Lime.UID = 'glass_lime';
Glass_Lime.prototype.parameters = Object.create(Glass_Lime.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_magenta
 * @name Glass_Magenta
 * @extends {module:blocks~Glass}
 * */
export class Glass_Magenta extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_magenta.png'),{transparent: true})}};
Glass_Magenta.UID = 'glass_magenta';
Glass_Magenta.prototype.parameters = Object.create(Glass_Magenta.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_orange
 * @name Glass_Orange
 * @extends {module:blocks~Glass}
 * */
export class Glass_Orange extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_orange.png'),{transparent: true})}};
Glass_Orange.UID = 'glass_orange';
Glass_Orange.prototype.parameters = Object.create(Glass_Orange.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_pink
 * @name Glass_Pink
 * @extends {module:blocks~Glass}
 * */
export class Glass_Pink extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_pink.png'),{transparent: true})}};
Glass_Pink.UID = 'glass_pink';
Glass_Pink.prototype.parameters = Object.create(Glass_Pink.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_purple
 * @name Glass_Purple
 * @extends {module:blocks~Glass}
 * */
export class Glass_Purple extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_purple.png'),{transparent: true})}};
Glass_Purple.UID = 'glass_purple';
Glass_Purple.prototype.parameters = Object.create(Glass_Purple.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_red
 * @name Glass_Red
 * @extends {module:blocks~Glass}
 * */
export class Glass_Red extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_red.png'),{transparent: true})}};
Glass_Red.UID = 'glass_red';
Glass_Red.prototype.parameters = Object.create(Glass_Red.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_silver
 * @name Glass_Silver
 * @extends {module:blocks~Glass}
 * */
export class Glass_Silver extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_silver.png'),{transparent: true})}};
Glass_Silver.UID = 'glass_silver';
Glass_Silver.prototype.parameters = Object.create(Glass_Silver.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_white
 * @name Glass_White
 * @extends {module:blocks~Glass}
 * */
export class Glass_White extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_white.png'),{transparent: true})}};
Glass_White.UID = 'glass_white';
Glass_White.prototype.parameters = Object.create(Glass_White.prototype.parameters,{
	transparent: {value: true}
})

/**
 * @class UID glass_yellow
 * @name Glass_Yellow
 * @extends {module:blocks~Glass}
 * */
export class Glass_Yellow extends Glass{CreateMaterial(){return basicMaterial(require('../res/img/blocks/glass_yellow.png'),{transparent: true})}};
Glass_Yellow.UID = 'glass_yellow';
Glass_Yellow.prototype.parameters = Object.create(Glass_Yellow.prototype.parameters,{
	transparent: {value: true}
})


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
