import * as THREE from "three";

/**
 * @typedef {Object} SceneTimer
 * @property {Function} callback
 * @property {Number} fireEvery
 * @property {Number} currentTime
 */

/** the base class for a scene */
export default class Scene {
	/** @type {Scene} */
	static get inst() {
		return this._inst || (this._inst = new this());
	}

	constructor() {
		/** @type {THREE.Scene} */
		this.scene = new THREE.Scene();

		/** @type {THREE.Clock} */
		this.clock = new THREE.Clock();

		/** @type {bool} */
		this.paused = false;

		/**
		 * an array of timers for the scene
		 * @type {SceneTimer[]}
		 */
		this.timers = [];
	}

	/**
	 * creates and registers a new timer with the scene
	 * @param {Function} callback
	 * @param {Number} fireEvery
	 */
	createTimer(callback, fireEvery) {
		this.timers.push({
			callback,
			fireEvery,
			currentTime: 0
		});
	}

	pause() {
		this.paused = true;

		return this;
	}

	unPause() {
		this.clock.getDelta();
		this.paused = false;

		return this;
	}

	update() {
		let dtime = Math.min(this.clock.getDelta(), 0.5); //clamp delta time
		this.animate(dtime);
		this.updateTimers(dtime);
		this.updateChildren(this.scene, dtime);
	}

	updateChildren(object = this.scene, dtime) {
		object.children.forEach(obj => {
			if (obj.update) obj.update(dtime);

			if (obj.children) this.updateChildren(obj, dtime);
		});
	}

	updateTimers(dtime = 0) {
		this.timers.forEach(timer => {
			timer.currentTime += dtime;

			if (timer.currentTime > timer.fireEvery) {
				timer.callback();
				timer.currentTime = 0;
			}
		});
	}

	/**
	 * updates the objects in the scene
	 * @param {number} dtime - the delta time
	 */
	animate(dtime) {}
}
