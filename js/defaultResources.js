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

function addDefaultResources(){
	var folder = resources.defineResource("folder",{
		name: "default"
	});

	//materials
	var materialFolder = folder.defineResource("folder",{
		name: "Materials"
	})
	var url = "res/img/blocks/";

	var stoneSounds = {
		stepSound: ["stepStone1","stepStone2","stepStone3","stepStone4"],
		placeSound: ["digStone1","digStone2","digStone3","digStone4"],
		removeSound: ["digStone1","digStone2","digStone3","digStone4"],
	}
	materialFolder.defineResource("material",{
		name: "Stone",
		materialID: "stone",
		material: basicMaterial(url+"stone.png").toJSON(),
		blockData: stoneSounds
	})

	materialFolder.defineResource("material",{
		name: "Grass",
		materialID: "grass",
		material: basicMaterial(url+"grass_top.png").toJSON(),
		blockData: {
			stepSound: ["stepGrass1","stepGrass2","stepGrass3","stepGrass4"],
			placeSound: ["digGrass1","digGrass2","digGrass3","digGrass4"],
			removeSound: ["digGrass1","digGrass2","digGrass3","digGrass4"],
		}
	})

	var gravelSounds = {
		stepSound: ["stepGravel1","stepGravel2","stepGravel3","stepGravel4"],
		placeSound: ["digGravel1","digGravel2","digGravel3","digGravel4"],
		removeSound: ["digGravel1","digGravel2","digGravel3","digGravel4"],
	}
	materialFolder.defineResource("material",{
		name: "Dirt",
		materialID: "dirt",
		material: basicMaterial(url+"dirt.png").toJSON(),
		blockData: gravelSounds
	})

	materialFolder.defineResource("material",{
		name: "Brick",
		materialID: "brick",
		material: basicMaterial(url+"brick.png").toJSON(),
		blockData: stoneSounds
	})

	materialFolder.defineResource("material",{
		name: "Gravel",
		materialID: "gravel",
		material: basicMaterial(url+"gravel.png").toJSON(),
		blockData: gravelSounds
	})

	//glass
	var glassData = {
		transparent: true,
		stepSound: ["stepStone1","stepStone2","stepStone3","stepStone4"],
		placeSound: ["digStone1","digStone2","digStone3","digStone4"],
		removeSound: ["digGlass1","digGlass2","digGlass3","digGlass4"]
	}
	materialFolder.defineResource("material",{
		name: "Glass",
		materialID: "glass",
		material: basicMaterial(url+"glass.png",{
			transparent: true,
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_black",
		materialID: "glass_black",
		material: basicMaterial(url+"glass_black.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_blue",
		materialID: "glass_blue",
		material: basicMaterial(url+"glass_blue.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_brown",
		materialID: "glass_brown",
		material: basicMaterial(url+"glass_brown.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_cyan",
		materialID: "glass_cyan",
		material: basicMaterial(url+"glass_cyan.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_gray",
		materialID: "glass_gray",
		material: basicMaterial(url+"glass_gray.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_green",
		materialID: "glass_green",
		material: basicMaterial(url+"glass_green.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_light_blue",
		materialID: "glass_light_blue",
		material: basicMaterial(url+"glass_light_blue.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_lime",
		materialID: "glass_lime",
		material: basicMaterial(url+"glass_lime.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_magenta",
		materialID: "glass_magenta",
		material: basicMaterial(url+"glass_magenta.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_orange",
		materialID: "glass_orange",
		material: basicMaterial(url+"glass_orange.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_pink",
		materialID: "glass_pink",
		material: basicMaterial(url+"glass_pink.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_purple",
		materialID: "glass_purple",
		material: basicMaterial(url+"glass_purple.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_red",
		materialID: "glass_red",
		material: basicMaterial(url+"glass_red.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_silver",
		materialID: "glass_silver",
		material: basicMaterial(url+"glass_silver.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_white",
		materialID: "glass_white",
		material: basicMaterial(url+"glass_white.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});
	materialFolder.defineResource("material",{
		name: "glass_yellow",
		materialID: "glass_yellow",
		material: basicMaterial(url+"glass_yellow.png",{
			transparent: true
		}).toJSON(),
		blockData: glassData
	});

	//clay
	materialFolder.defineResource("material",{
		name: "hardened_clay",
		materialID: "hardened_clay",
		material: basicMaterial(url+"hardened_clay.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_black",
		materialID: "hardened_clay_stained_black",
		material: basicMaterial(url+"hardened_clay_stained_black.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_blue",
		materialID: "hardened_clay_stained_blue",
		material: basicMaterial(url+"hardened_clay_stained_blue.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_brown",
		materialID: "hardened_clay_stained_brown",
		material: basicMaterial(url+"hardened_clay_stained_brown.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_cyan",
		materialID: "hardened_clay_stained_cyan",
		material: basicMaterial(url+"hardened_clay_stained_cyan.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_gray",
		materialID: "hardened_clay_stained_gray",
		material: basicMaterial(url+"hardened_clay_stained_gray.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_green",
		materialID: "hardened_clay_stained_green",
		material: basicMaterial(url+"hardened_clay_stained_green.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_light_blue",
		materialID: "hardened_clay_stained_light_blue",
		material: basicMaterial(url+"hardened_clay_stained_light_blue.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_lime",
		materialID: "hardened_clay_stained_lime",
		material: basicMaterial(url+"hardened_clay_stained_lime.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_magenta",
		materialID: "hardened_clay_stained_magenta",
		material: basicMaterial(url+"hardened_clay_stained_magenta.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_orange",
		materialID: "hardened_clay_stained_orange",
		material: basicMaterial(url+"hardened_clay_stained_orange.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_pink",
		materialID: "hardened_clay_stained_pink",
		material: basicMaterial(url+"hardened_clay_stained_pink.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_purple",
		materialID: "hardened_clay_stained_purple",
		material: basicMaterial(url+"hardened_clay_stained_purple.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_red",
		materialID: "hardened_clay_stained_red",
		material: basicMaterial(url+"hardened_clay_stained_red.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_silver",
		materialID: "hardened_clay_stained_silver",
		material: basicMaterial(url+"hardened_clay_stained_silver.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_white",
		materialID: "hardened_clay_stained_white",
		material: basicMaterial(url+"hardened_clay_stained_white.png").toJSON(),
		blockData: stoneSounds
	});
	materialFolder.defineResource("material",{
		name: "hardened_clay_stained_yellow",
		materialID: "hardened_clay_stained_yellow",
		material: basicMaterial(url+"hardened_clay_stained_yellow.png").toJSON(),
		blockData: stoneSounds
	});

	//planks
	var planksSounds = {
		stepSound: ["stepWood1","stepWood2","stepWood3","stepWood4"],
		placeSound: ["digWood1","digWood2","digWood3","digWood4"],
		removeSound: ["digWood1","digWood2","digWood3","digWood4"]
	}
	materialFolder.defineResource("material",{
		name: "planks_acacia",
		materialID: "planks_acacia",
		material: basicMaterial(url+"planks_acacia.png").toJSON(),
		blockData: planksSounds
	})
	materialFolder.defineResource("material",{
		name: "planks_big_oak",
		materialID: "planks_big_oak",
		material: basicMaterial(url+"planks_big_oak.png").toJSON(),
		blockData: planksSounds
	})
	materialFolder.defineResource("material",{
		name: "planks_birch",
		materialID: "planks_birch",
		material: basicMaterial(url+"planks_birch.png").toJSON(),
		blockData: planksSounds
	})
	materialFolder.defineResource("material",{
		name: "planks_jungle",
		materialID: "planks_jungle",
		material: basicMaterial(url+"planks_jungle.png").toJSON(),
		blockData: planksSounds
	})
	materialFolder.defineResource("material",{
		name: "planks_oak",
		materialID: "planks_oak",
		material: basicMaterial(url+"planks_oak.png").toJSON(),
		blockData: planksSounds
	})
	materialFolder.defineResource("material",{
		name: "planks_spruce",
		materialID: "planks_spruce",
		material: basicMaterial(url+"planks_spruce.png").toJSON(),
		blockData: planksSounds
	})

	//wool
	var clothSounds = {
		stepSound: ["stepCloth1","stepCloth2","stepCloth3","stepCloth4"],
		placeSound: ["digCloth1","digCloth2","digCloth3","digCloth4"],
		removeSound: ["digCloth1","digCloth2","digCloth3","digCloth4"]
	}
	materialFolder.defineResource("material",{
		name: "wool_colored_black",
		materialID: "wool_colored_black",
		material: basicMaterial(url+"wool_colored_black.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_blue",
		materialID: "wool_colored_blue",
		material: basicMaterial(url+"wool_colored_blue.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_brown",
		materialID: "wool_colored_brown",
		material: basicMaterial(url+"wool_colored_brown.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_cyan",
		materialID: "wool_colored_cyan",
		material: basicMaterial(url+"wool_colored_cyan.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_gray",
		materialID: "wool_colored_gray",
		material: basicMaterial(url+"wool_colored_gray.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_green",
		materialID: "wool_colored_green",
		material: basicMaterial(url+"wool_colored_green.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_light_blue",
		materialID: "wool_colored_light_blue",
		material: basicMaterial(url+"wool_colored_light_blue.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_lime",
		materialID: "wool_colored_lime",
		material: basicMaterial(url+"wool_colored_lime.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_magenta",
		materialID: "wool_colored_magenta",
		material: basicMaterial(url+"wool_colored_magenta.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_orange",
		materialID: "wool_colored_orange",
		material: basicMaterial(url+"wool_colored_orange.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_pink",
		materialID: "wool_colored_pink",
		material: basicMaterial(url+"wool_colored_pink.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_purple",
		materialID: "wool_colored_purple",
		material: basicMaterial(url+"wool_colored_purple.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_red",
		materialID: "wool_colored_red",
		material: basicMaterial(url+"wool_colored_red.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_silver",
		materialID: "wool_colored_silver",
		material: basicMaterial(url+"wool_colored_silver.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_white",
		materialID: "wool_colored_white",
		material: basicMaterial(url+"wool_colored_white.png").toJSON(),
		blockData: clothSounds
	});
	materialFolder.defineResource("material",{
		name: "wool_colored_yellow",
		materialID: "wool_colored_yellow",
		material: basicMaterial(url+"wool_colored_yellow.png").toJSON(),
		blockData: clothSounds
	});

	//rooms
}