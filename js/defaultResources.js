function addDefaultResources(){
	var folder = resources.defineResource('folder',{
		name: 'default'
	});

	//blocks
	var blocksFolder = folder.defineResource('folder',{
		name: 'blocks'
	});

	var air = blocksFolder.defineResource('block',{
		name: 'Air',
		blockID: 'air',
		blockData: {
			visible: false
		}
	})

	var stone = blocksFolder.defineResource('block',{
		name: 'Stone',
		blockID: 'stone',
		blockData: {
			canCollide: true,
			material: blocks.util.basicMaterial('stone.png').toJSON(),
			stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4'],
			placeSound: ['digStone1','digStone2','digStone3','digStone4'],
			removeSound: ['digStone1','digStone2','digStone3','digStone4'],
		}
	})

	var dirt = blocksFolder.defineResource('block',{
		name: 'Dirt',
		blockID: 'dirt',
		blockData: {
			canCollide: true,
			material: blocks.util.basicMaterial('dirt.png').toJSON(),
			stepSound: ['stepGravel1','stepGravel2','stepGravel3','stepGravel4'],
			placeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
			removeSound: ['digGravel1','digGravel2','digGravel3','digGravel4'],
		}
	})

	var grass = blocksFolder.defineResource('block',{
		name: 'Grass',
		blockID: 'grass',
		blockData: {
			canCollide: true,
			material: blocks.util.basicMaterial('grass_top.png').toJSON(),
			stepSound: ['stepGrass1','stepGrass2','stepGrass3','stepGrass4'],
			placeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
			removeSound: ['digGrass1','digGrass2','digGrass3','digGrass4'],
		}
	})

	var glass = blocksFolder.defineResource('block',{
		name: 'Glass',
		blockID: 'glass',
		blockData: {
			canCollide: true,
			transparent: true,
			material: blocks.util.basicMaterial('glass.png',{
				transparent: true
			}).toJSON(),
			stepSound: ['stepStone1','stepStone2','stepStone3','stepStone4'],
			placeSound: ['digStone1','digStone2','digStone3','digStone4'],
			removeSound: ['digGlass1','digGlass2','digGlass3','digGlass4'],
		}
	})

	//rooms
}