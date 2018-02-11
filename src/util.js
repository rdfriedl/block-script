import * as THREE from "three";

URL.parseSearch = function(url) {
	url = url || location.href;
	URL.parseSearch.cache = URL.parseSearch.cache || {};
	if (!URL.parseSearch.cache[url]) {
		const search = url.indexOf("?") !== -1 ? url.substr(url.indexOf("?") + 1, url.length + 1) : "";
		const queries = search
			.replace(/^\?/, "")
			.replace(/\+/g, " ")
			.split("&");
		URL.parseSearch.cache[url] = {};
		for (let i = 0; i < queries.length; i++) {
			const split = queries[i].split("=");
			if (split[0] !== "") URL.parseSearch.cache[url][split[0]] = split[1].length ? window.unescape(split[1]) : true;
		}
	}
	return URL.parseSearch.cache[url];
};

// JSON utils
JSON.fromBlob = function(blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			// if parsing fails it will throw
			try {
				let json = JSON.parse(reader.result);
				resolve(json);
			} catch (e) {
				reject(e);
			}
		};
		reader.onerror = reject;
		reader.readAsText(blob);
	});
};

Function.debounce = function(func, time) {
	let timeout;
	return function(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			func(...args);
		}, time);
	};
};

export function createDebugBox(size) {
	const geometry = new THREE.BufferGeometry();
	geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(72), 3));
	const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }), THREE.LinePieces);

	const min = size
		.clone()
		.divideScalar(2)
		.multiplyScalar(-1);
	const max = size.clone().divideScalar(2);

	/*
	  5____4
	1/___0/|
	| 6__|_7
	2/___3/
	0: max.x, max.y, max.z
	1: min.x, max.y, max.z
	2: min.x, min.y, max.z
	3: max.x, min.y, max.z
	4: max.x, max.y, min.z
	5: min.x, max.y, min.z
	6: min.x, min.y, min.z
	7: max.x, min.y, min.z
	*/

	const vertices = mesh.geometry.attributes.position.array;

	vertices[0] = max.x;
	vertices[1] = max.y;
	vertices[2] = max.z;
	vertices[3] = min.x;
	vertices[4] = max.y;
	vertices[5] = max.z;

	vertices[6] = min.x;
	vertices[7] = max.y;
	vertices[8] = max.z;
	vertices[9] = min.x;
	vertices[10] = min.y;
	vertices[11] = max.z;

	vertices[12] = min.x;
	vertices[13] = min.y;
	vertices[14] = max.z;
	vertices[15] = max.x;
	vertices[16] = min.y;
	vertices[17] = max.z;

	vertices[18] = max.x;
	vertices[19] = min.y;
	vertices[20] = max.z;
	vertices[21] = max.x;
	vertices[22] = max.y;
	vertices[23] = max.z;

	//

	vertices[24] = max.x;
	vertices[25] = max.y;
	vertices[26] = min.z;
	vertices[27] = min.x;
	vertices[28] = max.y;
	vertices[29] = min.z;

	vertices[30] = min.x;
	vertices[31] = max.y;
	vertices[32] = min.z;
	vertices[33] = min.x;
	vertices[34] = min.y;
	vertices[35] = min.z;

	vertices[36] = min.x;
	vertices[37] = min.y;
	vertices[38] = min.z;
	vertices[39] = max.x;
	vertices[40] = min.y;
	vertices[41] = min.z;

	vertices[42] = max.x;
	vertices[43] = min.y;
	vertices[44] = min.z;
	vertices[45] = max.x;
	vertices[46] = max.y;
	vertices[47] = min.z;

	//

	vertices[48] = max.x;
	vertices[49] = max.y;
	vertices[50] = max.z;
	vertices[51] = max.x;
	vertices[52] = max.y;
	vertices[53] = min.z;

	vertices[54] = min.x;
	vertices[55] = max.y;
	vertices[56] = max.z;
	vertices[57] = min.x;
	vertices[58] = max.y;
	vertices[59] = min.z;

	vertices[60] = min.x;
	vertices[61] = min.y;
	vertices[62] = max.z;
	vertices[63] = min.x;
	vertices[64] = min.y;
	vertices[65] = min.z;

	vertices[66] = max.x;
	vertices[67] = min.y;
	vertices[68] = max.z;
	vertices[69] = max.x;
	vertices[70] = min.y;
	vertices[71] = min.z;

	mesh.geometry.attributes.position.needsUpdate = true;

	mesh.geometry.computeBoundingSphere();

	// mesh.matrix = object.matrixWorld;
	// mesh.matrixAutoUpdate = false;
	return mesh;
}
