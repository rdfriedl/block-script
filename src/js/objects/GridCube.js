import THREE from 'three';

export default class GridCube extends THREE.Group{
	constructor(gridSize, cellSize, colorCenterLine, colorGrid){
		super();
		this.walls = {};
		this.cellSize = cellSize || 10;
		this.gridSize = gridSize || 10;
		this.colorCenterLine = colorCenterLine;
		this.colorGrid = colorGrid;
		this.sides = ['x','y','z'];

		this.buildGrid();
	}

	buildGrid(){
		// remove old grids
		this.children.forEach(child => {
			this.remove(child);
		})

		//create new grids
		this.sides.forEach(side => {
			this.walls[side] = this.walls[side] || {};

			[1,-1].forEach(s => {
				let normal = new THREE.Vector3();
				let grid = new THREE.GridHelper(this.gridSize*this.cellSize, this.cellSize, this.colorCenterLine, this.colorGrid);

				normal[side] = -s;
				grid.position[side] = this.gridSize*this.cellSize*s;
				grid.quaternion.setFromUnitVectors(grid.up, normal);

				this.add(grid);
				this.walls[side][s] = grid;
			})
		})
	}

	updateViewingDirection(viewingDirection){
		this.sides.forEach(side => {
			this.walls[side] = this.walls[side] || {};
			let s = Math.sign(viewingDirection[side]);
			for(let i in this.walls[side]){
				this.walls[side][i].visible = parseInt(i) == s;
			}
		})
	}
}
