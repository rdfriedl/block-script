import MazeGenerator from "./MazeGenerator.js";
import { Vector2 } from "three";

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

export default class RecursiveBackTracker extends MazeGenerator {
	/**
	 * @param  {Object} opts
	 * @param  {Number} [opts.paths=1] - the number of possible paths from "start" to "end"
	 * @return {RecursiveBackTracker} this
	 */
	generate(opts = {}) {
		super.generate();

		function processCell(position) {
			let weights = {};
			let tmpVec = new this.vec();
			let cell = this.createCell(position.clone());
			let checked = new this.vec();

			// get the weights
			this.axes.forEach((axis) => {
				weights[axis] = opts.weights ? opts.weights[axis] || 1 : 1;
			});

			let safety = 0;
			let done = false;
			while (!done && safety < 100000) {
				safety++;

				// pick as axis
				let axis = weightedRand(weights);
				let side;

				// if we have not checked either side pick a random one, other wise pick the one we have not checked
				if (checked[axis] & MazeGenerator.DOOR_NONE)
					side = Math.random() >= 0.5 ? MazeGenerator.DOOR_POSITIVE : MazeGenerator.DOOR_NEGATIVE;
				else
					side =
						checked[axis] & MazeGenerator.DOOR_POSITIVE ? MazeGenerator.DOOR_NEGATIVE : MazeGenerator.DOOR_POSITIVE;

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
						(side == MazeGenerator.DOOR_POSITIVE ? MazeGenerator.DOOR_NEGATIVE : MazeGenerator.DOOR_POSITIVE);

					// move to next cell
					processCell.call(this, tmpVec);
				}

				// set the checked
				checked[axis] = checked[axis] | side;

				// if we have check both sides of this axis remove it from the weights
				if (checked[axis] & MazeGenerator.DOOR_POSITIVE && checked[axis] & MazeGenerator.DOOR_NEGATIVE)
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
			}
		}

		// start
		processCell.call(this, this.start);
	}
}

// debug functions
if (process.env.NODE_ENV === "development") {
	window.print2DMaze = function (maze) {
		if (!(maze instanceof MazeGenerator)) {
			maze = new RecursiveBackTracker(Vector2, new Vector2(arguments[0] || 10, arguments[1] || 10));
			maze.generate(arguments[2]);
		}

		let str = "";
		let tmpVec = new Vector2();
		let X = MazeGenerator.DOOR_NONE;
		let P = MazeGenerator.DOOR_POSITIVE;
		let N = MazeGenerator.DOOR_NEGATIVE;
		for (let y = 0; y < maze.size.y; y++) {
			for (let x = 0; x < maze.size.x; x++) {
				let cell = maze.getCell(tmpVec.set(x, y)) || new Vector2();

				// strait
				if (cell.x === (P | N) && cell.y === X) str += "─";
				if (cell.x === X && cell.y === (P | N)) str += "│";

				// corners
				if (cell.x === P && cell.y === P) str += "┌";
				if (cell.x === N && cell.y === P) str += "┐";
				if (cell.x === N && cell.y === N) str += "┘";
				if (cell.x === P && cell.y === N) str += "└";

				// Ts
				if (cell.x === P && cell.y === (P | N)) str += "├";
				if (cell.x === N && cell.y === (P | N)) str += "┤";
				if (cell.x === (P | N) && cell.y === P) str += "┬";
				if (cell.x === (P | N) && cell.y === N) str += "┴";

				// ends
				if (cell.x === P && cell.y === X) str += "╶";
				if (cell.x === N && cell.y === X) str += "╴";
				if (cell.x === X && cell.y === P) str += "╷";
				if (cell.x === X && cell.y === N) str += "╵";

				// cross
				if (cell.x === (P | N) && cell.y === (P | N)) str += "┼";

				// nothing
				if (cell.x === X && cell.y === X) str += " ";
			}

			// new line
			str += "\n";
		}

		console.log("%c" + str, "font-size: 2em; background-color: white; color: black;");
	};
}
