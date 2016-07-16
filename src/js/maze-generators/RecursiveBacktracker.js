import MazeGenerator from './MazeGenerator.js';

/**
 * @class
 * @name RecursiveBacktracker
 * @extends {MazeGenerator}
 */
export default class RecursiveBacktracker extends MazeGenerator{
	/**
	 * @param  {Object} opts
	 * @param  {Number} [opts.paths=1] - the number of posible paths from "start" to "end"
	 * @return {this}
	 */
	generate(opts){
		super.generate();

		function processCell(position) {
			let tmpVec = new this.vec();
			let cell = this.createCell(position);
			let dirs = []; //array of [axis, +-1 (side)]
			let sides = [1,-1];

			// loop though each axis
			for (var i = 0; i < this.axes.length; i++) {
				let axis = this.axes[i];

				// add -1 and +s
				for (let s = 0; s < sides.length; s++) {
					tmpVec.copy(position);
					tmpVec[axis] += sides[s];
					if(this.checkPosition(tmpVec))
						dirs.push([axis, sides[s]]);
				}
			}

			while(dirs.length){
				let dir = dirs[Math.floor(Math.random() * dirs.length)];
				dirs.splice(dirs.indexOf(dir), 1);

				tmpVec.copy(position);
				tmpVec[dir[0]] += dir[1];

				// check cell
				if(!this.getCell(tmpVec)){
					// make an opening in this cell
					cell[dir[0]] = cell[dir[0]] | (dir[1] > 0? MazeGenerator.DOOR_POSITIVE : MazeGenerator.DOOR_NEGATIVE);

					// create new cell
					let openedCell = this.createCell(tmpVec);

					// make an opening in the next cell
					openedCell[dir[0]] = openedCell[dir[0]] | (dir[1] > 0? MazeGenerator.DOOR_NEGATIVE : MazeGenerator.DOOR_POSITIVE);

					// move to next cell
					processCell.call(this, tmpVec);
				}
			}
		}

		// start
		processCell.call(this, this.start);
	}
}
