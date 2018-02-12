import * as THREE from "three";

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
	}

	update() {
		let dtime = Math.min(this.clock.getDelta(), 0.5); //clamp delta time
		this.animate(dtime);
	}

	/**
	 * updates the objects in the scene
	 * @param {number} dtime - the delta time
	 * */
	animate(dtime) {}
}
