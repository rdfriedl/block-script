import THREE from 'three';
import 'imports?THREE=three!../lib/threejs/loaders/PLYLoader.js';

// import all the tests
let models = [];
let files = require.context('../res/models/models/', true, /\.ply$/);
let loader = new THREE.PLYLoader();
files.keys().forEach(url => {
	models.push({
		id: url.match(/[^\/]*(?=\.ply)/gi)[0],
		url: files(url),
		loader: (url,cb) => {
			loader.load(url, geometry => {
				geometry.computeFaceNormals();
				let mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
					vertexColors: THREE.VertexColors
				}));
				mesh.scale.set(2,2,2);
				mesh.rotation.set(-Math.PI/2,0,0);
				cb(mesh);
			});
		}
	})
})

export {models as default};
