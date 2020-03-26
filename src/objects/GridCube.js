import { Group, Vector3, GridHelper } from "three";

export default class GridCube extends Group {
	constructor(gridSize, cellSize, colorCenterLine, colorGrid) {
		super();
		this.walls = {};
		this.cellSize = cellSize || new Vector3();
		this.gridSize = gridSize || new Vector3();
		this.colorCenterLine = colorCenterLine;
		this.colorGrid = colorGrid;
		this.sides = ["x", "y", "z"];

		this.buildGrid();
	}

	buildGrid() {
		// remove old grids
		this.children.forEach((child) => {
			this.remove(child);
		});

		// create new grids
		this.sides.forEach((side) => {
			this.walls[side] = this.walls[side] || {};

			[1, -1].forEach((s) => {
				let gridSize = new Vector2();
				let cellSize = new Vector2();
				switch (side) {
					case "x":
						gridSize.set(this.gridSize.y, this.gridSize.z);
						cellSize.set(this.cellSize.y, this.cellSize.z);
						break;
					case "y":
						gridSize.set(this.gridSize.x, this.gridSize.z);
						cellSize.set(this.cellSize.x, this.cellSize.z);
						break;
					case "z":
						gridSize.set(this.gridSize.x, this.gridSize.y);
						cellSize.set(this.cellSize.x, this.cellSize.y);
						break;
				}

				let normal = new Vector3();
				let grid = new GridHelper(gridSize.clone().multiply(cellSize), cellSize, this.colorCenterLine, this.colorGrid);

				normal[side] = -s;
				grid.position[side] = this.gridSize[side] * this.cellSize[side] * s;
				grid.quaternion.setFromUnitVectors(grid.up, normal);

				this.add(grid);
				this.walls[side][s] = grid;
			});
		});
	}

	updateViewingDirection(viewingDirection) {
		this.sides.forEach((side) => {
			this.walls[side] = this.walls[side] || {};
			let s = viewingDirection ? Math.sign(viewingDirection[side]) : 0;
			for (let i in this.walls[side]) {
				this.walls[side][i].visible = s != 0 ? parseInt(i) == s : true;
			}
		});
	}
}
