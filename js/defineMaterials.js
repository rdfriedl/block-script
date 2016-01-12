function basicMaterial(url,prop,texProp){
	var mat = new THREE.MeshLambertMaterial({
		map: loadTexture(url,texProp),
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

var url = "res/img/blocks/";
var i;

var stoneSounds = {
	stepSound: ["stepStone1","stepStone2","stepStone3","stepStone4"],
	placeSound: ["digStone1","digStone2","digStone3","digStone4"],
	removeSound: ["digStone1","digStone2","digStone3","digStone4"],
};
//stone
materials.addMaterial(new Material(
	"stone",
	basicMaterial(url+"stone.png"),
	stoneSounds
),true);

//grass
materials.addMaterial(new Material(
	"grass",
	basicMaterial(url+"grass_top.png"),
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
materials.addMaterial(new Material(
	"dirt",
	basicMaterial(url+"dirt.png"),
	gravelSounds
),true);

//brick
materials.addMaterial(new Material(
	"brick",
	basicMaterial(url+"brick.png"),
	stoneSounds
),true);

//gravel
materials.addMaterial(new Material(
	"gravel",
	basicMaterial(url+"gravel.png"),
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
materials.addMaterial(new Material(
	"glass",
	basicMaterial(url+"glass.png",{
		transparent: true,
	}),
	glassData
),true);
for(i in glassColors){
	materials.addMaterial(new Material(
		"glass_"+glassColors[i],
		basicMaterial(url+"glass_"+glassColors[i]+".png",{
			transparent: true
		}),
		glassData
	),true);
}

//clay
materials.addMaterial(new Material(
	"hardened_clay",
	basicMaterial(url+"hardened_clay.png"),
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
	materials.addMaterial(new Material(
		"hardened_clay_stained_"+clayColors[i],
		basicMaterial(url+"hardened_clay_stained_"+clayColors[i]+".png"),
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
	materials.addMaterial(new Material(
		"planks_"+woodTypes[i],
		basicMaterial(url+"planks_"+woodTypes[i]+".png"),
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
	materials.addMaterial(new Material(
		"wool_colored_"+woolColors[i],
		basicMaterial(url+"wool_colored_"+woolColors[i]+".png"),
		clothSounds
	),true);
}

} //defineMaterials -- end --
