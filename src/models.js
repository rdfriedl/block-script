import { PLYLoader, Mesh, MeshStandardMaterial, VertexColors } from "three";
import "three/examples/js/loaders/PLYLoader.js";
import ModelManager from "./ModelManager.js";

// import all the tests
let models = new ModelManager();
let files = require.context("./res/models/models/", true, /\.ply$/);
let loader = new PLYLoader();
files.keys().forEach(url => {
	models.register(url.match(/[^/]*(?=\.ply)/gi)[0], files(url), (url, cb) => {
		loader.load(url, geometry => {
			geometry.computeFaceNormals();
			let mesh = new Mesh(
				geometry,
				new MeshStandardMaterial({
					vertexColors: VertexColors
				})
			);
			mesh.scale.set(2, 2, 2);
			mesh.rotation.set(-Math.PI / 2, 0, 0);
			cb(mesh);
		});
	});
});

export { models as default };
