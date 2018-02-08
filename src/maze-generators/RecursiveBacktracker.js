import MazeGenerator from "./MazeGenerator.js";

function weightedRand(spec) {
	let total = 0;
	for (let i in spec) total += spec[i];

	var sum = 0,
		r = Math.random() * total;
	for (let i in spec) {
		sum += spec[i];
		if (r <= sum) return i;
	}
}

/**
 * @class
 * @name RecursiveBacktracker
 * @extends {MazeGenerator}
 */
export default class RecursiveBacktracker extends MazeGenerator {
	/**
	 * @param  {Object} opts
	 * @param  {Number} [opts.paths=1] - the number of posible paths from "start" to "end"
	 * @return {this}
	 */
	generate(opts = {}) {
		super.generate();

		function processCell(position) {
			let weights = {};
			let tmpVec = new this.vec();
			let cell = this.createCell(position.clone());
			let checked = new this.vec();

			// get the weights
			this.axes.forEach(axis => {
				weights[axis] = opts.weights ? opts.weights[axis] || 1 : 1;
			});

			let safey = 0;
			let done = false;
			while (!done && safey < 100000) {
				safey++;

				// pick as axis
				let axis = weightedRand(weights);
				let side;

				// if we have not checked either side pick a random one, other wise pick the one we have not checked
				if (checked[axis] & MazeGenerator.DOOR_NONE)
					side =
						Math.random() >= 0.5
							? MazeGenerator.DOOR_POSITIVE
							: MazeGenerator.DOOR_NEGATIVE;
				else
					side =
						checked[axis] & MazeGenerator.DOOR_POSITIVE
							? MazeGenerator.DOOR_NEGATIVE
							: MazeGenerator.DOOR_POSITIVE;

				// make sure we have not check this side yet
				if (checked[axis] & side) continue;

				tmpVec.copy(position);
				tmpVec[axis] += side == MazeGenerator.DOOR_POSITIVE ? 1 : -1;

				// make sure there is not another cell on this aide
				if (this.checkPosition(tmpVec) && !this.getCell(tmpVec)) {
					cell[axis] = cell[axis] | side;

					// create new cell
					let openedCell = this.createCell(tmpVec.clone());

					// make an opening in the next cell
					openedCell[axis] =
						openedCell[axis] |
						(side == MazeGenerator.DOOR_POSITIVE
							? MazeGenerator.DOOR_NEGATIVE
							: MazeGenerator.DOOR_POSITIVE);

					// move to next cell
					processCell.call(this, tmpVec);
				}

				// set the checked
				checked[axis] = checked[axis] | side;

				// if we have check both sides of this axis remove it from the weights
				if (
					checked[axis] & MazeGenerator.DOOR_POSITIVE &&
					checked[axis] & MazeGenerator.DOOR_NEGATIVE
				)
					delete weights[axis];

				// check to see if we have checked every side
				done = true;
				for (var i = 0; i < this.axes.length; i++) {
					if (
						!(checked[this.axes[i]] & MazeGenerator.DOOR_POSITIVE) ||
						!(checked[this.axes[i]] & MazeGenerator.DOOR_NEGATIVE)
					) {
						done = false;
						break;
					}
				}

				console;
			}
		}

		// start
		processCell.call(this, this.start);
	}
}
