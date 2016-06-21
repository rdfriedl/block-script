import THREE from 'three';
import {Materials, Material} from './materials.js';

function basicMaterial(url,prop,texProp){
	var mat = new THREE.MeshLambertMaterial({
		map: loadTexture(url, texProp),
		reflectivity: 0
	});

	if(prop){
        //set the prop
        for(var i in prop){
        	mat[i] = prop[i];
        }
	}

	return mat;
}

function mutiMaterial(mats){
	mats = mats || [];
	var mat = new THREE.MeshFaceMaterial(mats);
	return mat;
}

function defineMaterials(){ //defineMaterials -- start --

var i;

var stoneSounds = {
	stepSound: ["stepStone1","stepStone2","stepStone3","stepStone4"],
	placeSound: ["digStone1","digStone2","digStone3","digStone4"],
	removeSound: ["digStone1","digStone2","digStone3","digStone4"],
};
//stone
Materials.inst.addMaterial(new Material(
	"stone",
	basicMaterial(require("../res/img/blocks/stone.png")), //require the image so webpack compiles it
	stoneSounds
),true);

//grass
Materials.inst.addMaterial(new Material(
	"grass",
	basicMaterial(require("../res/img/blocks/grass_top.png")),
	{
		stepSound: ["stepGrass1","stepGrass2","stepGrass3","stepGrass4"],
		placeSound: ["digGrass1","digGrass2","digGrass3","digGrass4"],
		removeSound: ["digGrass1","digGrass2","digGrass3","digGrass4"],
	}
),true);

var gravelSounds = {
	stepSound: ["stepGravel1","stepGravel2","stepGravel3","stepGravel4"],
	placeSound: ["digGravel1","digGravel2","digGravel3","digGravel4"],
	removeSound: ["digGravel1","digGravel2","digGravel3","digGravel4"],
};
//dirt
Materials.inst.addMaterial(new Material(
	"dirt",
	basicMaterial(require("../res/img/blocks/dirt.png")),
	gravelSounds
),true);

//brick
Materials.inst.addMaterial(new Material(
	"brick",
	basicMaterial(require("../res/img/blocks/brick.png")),
	stoneSounds
),true);

//gravel
Materials.inst.addMaterial(new Material(
	"gravel",
	basicMaterial(require("../res/img/blocks/gravel.png")),
	gravelSounds
),true);

//glass
var glassData = {
	transparent: true,
	stepSound: ["stepStone1","stepStone2","stepStone3","stepStone4"],
	placeSound: ["digStone1","digStone2","digStone3","digStone4"],
	removeSound: ["digGlass1","digGlass2","digGlass3","digGlass4"]
};
var glassColors = [
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
Materials.inst.addMaterial(new Material(
	"glass",
	basicMaterial(require("../res/img/blocks/glass.png"),{
		transparent: true,
	}),
	glassData
),true);
for(i in glassColors){
	Materials.inst.addMaterial(new Material(
		"glass_"+glassColors[i],
		basicMaterial(require("../res/img/blocks/glass_"+glassColors[i]+".png"),{
			transparent: true
		}),
		glassData
	),true);
}

//clay
Materials.inst.addMaterial(new Material(
	"hardened_clay",
	basicMaterial(require("../res/img/blocks/hardened_clay.png")),
	stoneSounds
),true);
var clayColors = [
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
for(i in clayColors){
	Materials.inst.addMaterial(new Material(
		"hardened_clay_stained_"+clayColors[i],
		basicMaterial(require("../res/img/blocks/hardened_clay_stained_"+clayColors[i]+".png")),
		stoneSounds
	),true);
}

//planks
var woodSounds = {
	stepSound: ["stepWood1","stepWood2","stepWood3","stepWood4"],
	placeSound: ["digWood1","digWood2","digWood3","digWood4"],
	removeSound: ["digWood1","digWood2","digWood3","digWood4"]
};
var woodTypes = [
	'acacia',
	'big_oak',
	'birch',
	'jungle',
	'oak',
	'spruce'
];
for(i in woodTypes){
	Materials.inst.addMaterial(new Material(
		"planks_"+woodTypes[i],
		basicMaterial(require("../res/img/blocks/planks_"+woodTypes[i]+".png")),
		woodSounds
	),true);
}

//wool
var clothSounds = {
	stepSound: ["stepCloth1","stepCloth2","stepCloth3","stepCloth4"],
	placeSound: ["digCloth1","digCloth2","digCloth3","digCloth4"],
	removeSound: ["digCloth1","digCloth2","digCloth3","digCloth4"]
};
var woolColors = [
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
for(i in woolColors){
	Materials.inst.addMaterial(new Material(
		"wool_colored_"+woolColors[i],
		basicMaterial(require("../res/img/blocks/wool_colored_"+woolColors[i]+".png")),
		clothSounds
	),true);
}

} //defineMaterials -- end --

export {defineMaterials as default};
