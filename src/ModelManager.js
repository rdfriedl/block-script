import THREE from "three";

/** manages and loads models */
export default class ModelManager {
	constructor() {
		/**
		 * the cache for all the registed models
		 * @type {Object}
		 * @private
		 */
		this.models = {};

		/**
		 * the geometry to use while the model is loading
		 * @type {THREE.Geometry)
		 * @private
		 */
		this.tmpGeometry = new THREE.Geometry();

		/**
		 * the material to use while the model is loading
		 * @type {THREE.Material)
		 * @private
		 */
		this.tmpMaterial = new THREE.MeshNormalMaterial();
	}

	/**
	 * returns a singlton ModelManager
	 * @return {ModelManager}
	 * @memberOf ModelManager
	 * @static
	 */
	static get inst() {
		return this._inst || (this._inst = new this());
	}

	/**
	 * registers a model.
	 * NOTE: the loader needs to have a callback that returns a THREE.Mesh
	 * @param  {String} id - the id to be used for this model
	 * @param  {String} url - the url to the model file
	 * @param  {Function} loader - a function that takes (url, callback)
	 * @return {this}
	 */
	register(id, url, loader) {
		if (this.has(id)) return this;

		this.models[id] = {
			loading: false,
			loader: loader,
			url: url,
			mesh: undefined,
			callbacks: [],
			meshes: [],
		};

		return this;
	}

	/**
	 * [registerMany description]
	 * @param  {Object[]} models - an array of models
	 * @param  {String} models.id - the id to be used for this model
	 * @param  {String} models.url - the url to the model file
	 * @param  {Function} models.loader - a function that takes (url, callback)
	 * @return {this}
	 */
	registerMany(models) {
		if (Array.isArray(models)) {
			models.filter(m => !this.has(m.id)).forEach(data => {
				this.register(data.id, data.url, data.loader);
			});
		}
		return this;
	}

	/**
	 * @param  {String} id - the id of the model to check for
	 * @return {Boolean}
	 */
	has(id) {
		return !!this.models[id];
	}

	/**
	 * returns a mesh for the model.
	 * if the model is not loaded yet, it returns a empty mesh and adds the geometry and material to it when it model loads
	 * @param {String} id - the id of the model
	 * @param {Function} [cb] - called when the model is loaded, if the model is already loaded it will be called
	 * @return {THREE.Mesh}
	 */
	getMesh(id, cb) {
		if (this.has(id)) {
			let model = this.models[id];

			if (model.mesh) return model.mesh.clone();

			// load model
			if (!model.loading) {
				model.loader(model.url, mesh => {
					model.mesh = mesh;
					model.loading = false;

					for (let mesh of model.meshes) {
						mesh.copy(model.mesh);
						mesh.geometry = model.mesh.geometry;
						mesh.material = model.mesh.material;
					}
					delete model.meshes;

					model.callbacks.forEach(cb => cb());
					delete model.callbacks;
				});
			}

			// model is loading, add a callback
			let mesh = new THREE.Mesh(this.tmpGeometry, this.tmpMaterial);
			model.meshes.push(mesh);
			if (cb) model.callbacks.push(cb);
			return mesh;
		} else console.warn("no model with id: " + id);
	}

	/**
	 * returns an array of model ids that are registered in the manager
	 * @return {String[]}
	 */
	listModels() {
		return Reflect.ownKeys(this.models);
	}
}
