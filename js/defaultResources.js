function addDefaultResources(){
	var folder = resources.defineResource('folder',{
		name: 'default'
	});

	//materials
	var materialFolder = folder.defineResource('folder',{
		name: "Materials"
	})
	var url = 'res/img/blocks/';

	materialFolder.defineResource('material',{
		name: 'Stone',
		materialID: 'stone',
		material: basicMaterial(url+'stone.png').toJSON(),
		blockData: {
			stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4'],
			placeSound: ['digStone1','digStone2','digStone3','digStone4'],
			removeSound: ['digStone1','digStone2','digStone3','digStone4'],
		}
	})

	materialFolder.defineResource('material',{
		name: 'Grass',
		materialID: 'grass',
		material: basicMaterial(url+'grass_top.png').toJSON(),
		blockData: {
			stepSound: ['stepGrass1','stepGrass2','stepGrass3','stepGrass4'],
			placeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
			removeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
		}
	})

	materialFolder.defineResource('material',{
		name: 'Dirt',
		materialID: 'dirt',
		material: basicMaterial(url+'dirt.png').toJSON(),
		blockData: {
			stepSound: ['stepGravel1','stepGravel2','stepGravel3','stepGravel4'],
			placeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
			removeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
		}
	})

	materialFolder.defineResource('material',{
		name: 'Glass',
		materialID: 'glass',
		material: basicMaterial(url+'glass.png',{
			transparent: true,
		}).toJSON(),
		blockData: {
			transparent: true,
			stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4'],
			placeSound: ['digStone1','digStone2','digStone3','digStone4'],
			removeSound: ['digGlass1','digGlass2','digGlass3','digGlass4'],
		}
	})

	//rooms
}