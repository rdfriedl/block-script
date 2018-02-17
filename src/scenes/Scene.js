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

		/** @type {bool} */
		this.paused = false;
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
		this.updateChildren(this.scene, dtime);
	}

	updateChildren(object = this.scene, dtime) {
		object.children.forEach(obj => {
			if (obj.update) obj.update(dtime);

			if (obj.children) this.updateChildren(obj, dtime);
		});
	}

	/**
	 * updates the objects in the scene
	 * @param {number} dtime - the delta time
	 * */
	animate(dtime) {}
}
