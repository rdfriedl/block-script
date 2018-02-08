import THREE from 'three';

/**
 * @class main class for maze generators
 * @name MazeGenerator
 * @param {THREE.Vector2|THREE.Vector3|THREE.Vector4} vecClass - the type of vector to use
 */
export default class MazeGenerator{
	constructor(vecClass, size){
		/**
		 * the type of vector to use
		 * @type {THREE.Vector2|THREE.Vector3|THREE.Vector4}
		 */
		this.vec = vecClass;

		/**
		 * an array of axes on the vector
		 * @private
		 * @type {String[]}
		 */
		this.axes = Reflect.ownKeys(new this.vec());

		/**
		 * an object that holds the cells
		 * @type {Object}
		 * @private
		 */
		this.cells = {};

		/**
		 * the size of the maze
		 * @type {MazeGenerator#vec}
		 */
		this.size = new this.vec();
		if(size) this.size.copy(size);
		this.size.round();

		// make sure the maze is bigger then 2
		for (var i = 0; i < this.axes.length; i++) {
			if(this.size[this.axes[i]] <= 2)
				throw new Error('the maze has to be bigger then 2 on the ' + this.axes[i] + ' axis');
		}

		/**
		 * the starting point
		 * @type {MazeGenerator#vec}
		 */
		this.start = new this.vec();
		this.axes.forEach(axis => {
			this.start[axis] = Math.random();
		});
		this.start.multiply(this.size).floor();

		/**
		 * the end point
		 * @type {MazeGenerator#vec}
		 */
		this.end = this.start.clone();
		while(this.end.equals(this.start)){
			this.axes.forEach(axis => {
				this.end[axis] = Math.random();
			});
			this.end.multiply(this.size).floor();
		}
	}

	/**
	 * check to see if the position is in the maze
	 * @param {MazeGenerator#vec} position
	 * @return {Boolean}
	 */
	checkPosition(position){
		// make sure that we are not outside of the maze
		for (var i = 0; i < this.axes.length; i++) {
			let axis = this.axes[i];
			if(position[axis] < 0 || position[axis] >= this.size[axis])
				return false;
		}
		return true;
	}

	/**
	 * returns the cell at position or creates a new one
	 * @param {MazeGenerator#vec} position
	 * @return {MazeGenerator#vec}
	 */
	createCell(position){
		if(!(position instanceof this.vec))
			return;

		// make sure that we are not outside of the maze
		if(!this.checkPosition(position))
			return;

		let cell = this.getCell(position);
		if(cell)
			return cell;
		else{
			cell = new this.vec();
			this.setCell(position, cell);
			return cell;
		}
	}

	/**
	 * returns the data on a cell if it exits
	 * @param {MazeGenerator#vec} position
	 * @return {MazeGenerator#vec}
	 */
	getCell(position){
		if(!(position instanceof this.vec))
			return;

		// make sure that we are not outside of the maze
		if(!this.checkPosition(position))
			return;

		return this.cells[position.toArray().join(',')];
	}

	/**
	 * sets the data for a certain cell
	 * @param {MazeGenerator#vec} position
	 * @return {this}
	 */
	setCell(position, data){
		if(!(position instanceof this.vec))
			return;

		// make sure that we are not outside of the maze
		if(!this.checkPosition(position))
			return;

		this.cells[position.toArray().join(',')] = data;

		return this;
	}

	/**
	 * populates the cells with data
	 * @return {this}
	 */
	generate(opts){
		if(Reflect.ownKeys(this.cells).length > 0)
			throw new Error('MazeGenerator.generate() has already been called');
	}
}

// bit masks for cell axes
MazeGenerator.DOOR_NONE = 0; // bits: 00
MazeGenerator.DOOR_POSITIVE = MazeGenerator.DOOR_UP = 2; // bits: 10
MazeGenerator.DOOR_NEGATIVE = MazeGenerator.DOOR_DOWN = 1; // bits: 01

// debug functions
if(process.env.NODE_ENV == 'development'){
	window.print2DMaze = function(maze){
		if(!(maze instanceof MazeGenerator)){
			maze = new RecursiveBacktracker(THREE.Vector2, new THREE.Vector2(arguments[0] || 10, arguments[1] || 10));
			maze.generate(arguments[2]);
		}

		let str = '';
		let tmpVec = new THREE.Vector2();
		let X = MazeGenerator.DOOR_NONE;
		let P = MazeGenerator.DOOR_POSITIVE;
		let N = MazeGenerator.DOOR_NEGATIVE;
		for (let y = 0; y < maze.size.y; y++) {
			for (let x = 0; x < maze.size.x; x++) {
				let cell = maze.getCell(tmpVec.set(x,y)) || new THREE.Vector2();

				// strait
				if(cell.x == (P | N) && cell.y == (X)) str += '─';
				if(cell.x == (X) && cell.y == (P | N)) str += '│';

				// corners
				if(cell.x == (P) && cell.y == (P)) str += '┌';
				if(cell.x == (N) && cell.y == (P)) str += '┐';
				if(cell.x == (N) && cell.y == (N)) str += '┘';
				if(cell.x == (P) && cell.y == (N)) str += '└';

				// Ts
				if(cell.x == (P) && cell.y == (P | N)) str += '├';
				if(cell.x == (N) && cell.y == (P | N)) str += '┤';
				if(cell.x == (P | N) && cell.y == (P)) str += '┬';
				if(cell.x == (P | N) && cell.y == (N)) str += '┴';

				// ends
				if(cell.x == (P) && cell.y == (X)) str += '╶';
				if(cell.x == (N) && cell.y == (X)) str += '╴';
				if(cell.x == (X) && cell.y == (P)) str += '╷';
				if(cell.x == (X) && cell.y == (N)) str += '╵';

				// cross
				if(cell.x == (P | N) && cell.y == (P | N)) str += '┼';

				// nothing
				if(cell.x == (X) && cell.y == (X)) str += ' ';
			}

			// new line
			str += '\n';
		}

		console.log('%c' + str, 'font-size: 2em; background-color: white; color: black;');
	}
}

import RecursiveBacktracker from './RecursiveBacktracker.js';
