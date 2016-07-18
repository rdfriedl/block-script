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
		this.size = new this.vec(1,1,1);
		if(size) this.size.copy(size);

		/**
		 * the starting point
		 * @type {MazeGenerator#vec}
		 */
		this.start = new this.vec();
		this.axes.forEach(axis => this.start[axis] = Math.random());
		this.start.multiply(this.size).floor();

		/**
		 * the end point
		 * @type {MazeGenerator#vec}
		 */
		this.end = this.start.clone();
		while(this.end.equals(this.start)){
			this.axes.forEach(axis => this.end[axis] = Math.random());
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
MazeGenerator.DOOR_NONE = 0; //bits: 00
MazeGenerator.DOOR_POSITIVE = MazeGenerator.DOOR_UP = 2; //bits: 10
MazeGenerator.DOOR_NEGATIVE = MazeGenerator.DOOR_DOWN = 1; //bits: 01
