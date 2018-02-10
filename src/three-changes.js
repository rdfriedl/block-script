import THREE from "three";

THREE.EventDispatcher.prototype.dispatchEvent = function(event) {
	if (this._listeners === undefined) return;

	let listeners = this._listeners;
	let listenerArray = listeners[event.type];

	if (listenerArray !== undefined) {
		event.target = event.target || this;

		let array = [],
			i = 0;
		let length = listenerArray.length;

		for (i = 0; i < length; i++) {
			array[i] = listenerArray[i];
		}

		for (i = 0; i < length; i++) {
			array[i].call(this, event);
		}
	}
};

// make it so axis helper can take a THREE.Vector3 as first arg
THREE.AxisHelper = function(size) {
	if (!(size instanceof THREE.Vector3)) size = new THREE.Vector3(size || 1, size || 1, size || 1);

	let vertices = new Float32Array([0, 0, 0, size.x, 0, 0, 0, 0, 0, 0, size.y, 0, 0, 0, 0, 0, 0, size.z]);

	let colors = new Float32Array([1, 0, 0, 1, 0.6, 0, 0, 1, 0, 0.6, 1, 0, 0, 0, 1, 0, 0.6, 1]);

	let geometry = new THREE.BufferGeometry();
	geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
	geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));

	let material = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors,
	});

	THREE.LineSegments.call(this, geometry, material);
};

THREE.AxisHelper.prototype = Object.create(THREE.LineSegments.prototype);
THREE.AxisHelper.prototype.constructor = THREE.AxisHelper;

// make it so grid helper can take a THREE.Vector2 as the size
THREE.GridHelper = function(size, step, color1, color2) {
	color1 = new THREE.Color(color1 !== undefined ? color1 : 0x444444);
	color2 = new THREE.Color(color2 !== undefined ? color2 : 0x888888);

	let vertices = [];
	let colors = [];

	if (!(size instanceof THREE.Vector2)) size = new THREE.Vector2(size || 0, size || 0);

	if (!(step instanceof THREE.Vector2)) step = new THREE.Vector2(step || 0, step || 0);

	let offset = 0;
	for (let i = -size.x; i <= size.x; i += step.x) {
		vertices.push(i, 0, -size.y, i, 0, size.y);

		let color = i === 0 ? color1 : color2;

		color.toArray(colors, offset);
		offset += 3;
		color.toArray(colors, offset);
		offset += 3;
	}
	for (let i = -size.y; i <= size.y; i += step.y) {
		vertices.push(-size.x, 0, i, size.x, 0, i);

		let color = i === 0 ? color1 : color2;

		color.toArray(colors, offset);
		offset += 3;
		color.toArray(colors, offset);
		offset += 3;
	}

	let geometry = new THREE.BufferGeometry();
	geometry.addAttribute("position", new THREE.Float32Attribute(vertices, 3));
	geometry.addAttribute("color", new THREE.Float32Attribute(colors, 3));

	let material = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors,
	});

	THREE.LineSegments.call(this, geometry, material);
};

THREE.GridHelper.prototype = Object.create(THREE.LineSegments.prototype);
THREE.GridHelper.prototype.constructor = THREE.GridHelper;

// fix up vector classes
THREE.Vector2.prototype.multiply = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	return this;
};
THREE.Vector4.prototype.multiply = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	this.z *= v.z;
	this.w *= v.w;
	return this;
};
THREE.Vector2.prototype.divide = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	return this;
};
THREE.Vector4.prototype.divide = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	this.z /= v.z;
	this.w /= v.w;
	return this;
};

// vec to / from string
THREE.Vector2.prototype.toString = function() {
	return `${this.x},${this.y}`;
};
THREE.Vector2.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

THREE.Vector3.prototype.toString = function() {
	return `${this.x},${this.y},${this.z}`;
};
THREE.Vector3.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

THREE.Vector4.prototype.toString = function() {
	return `${this.x},${this.y},${this.z},${this.w}`;
};
THREE.Vector4.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

THREE.Vector3.prototype.map = function(fn) {
	this.x = fn(this.x, "x");
	this.y = fn(this.y, "y");
	this.z = fn(this.z, "z");
	return this;
};
THREE.Vector3.prototype.sign = function() {
	this.x = Math.sign(this.x);
	this.y = Math.sign(this.y);
	this.z = Math.sign(this.z);
	return this;
};
THREE.Vector3.prototype.empty = function() {
	return !this.x && !this.y && !this.z;
};
THREE.Vector3.prototype.abs = function() {
	this.x = Math.abs(this.x);
	this.y = Math.abs(this.y);
	this.z = Math.abs(this.z);
	return this;
};

// export maps on materials
THREE.Material.prototype._toJSON = THREE.Material.prototype.toJSON;
THREE.Material.prototype.toJSON = function() {
	var output = THREE.Material.prototype._toJSON.apply(this);
	if (this.map) output.map = this.map.toJSON();
	if (this.lightMap) output.lightMap = this.lightMap.toJSON();
	if (this.specularMap) output.specularMap = this.specularMap.toJSON();
	if (this.alphaMap) output.alphaMap = this.alphaMap.toJSON();
	if (this.envMap) output.envMap = this.envMap.toJSON();
	return output;
};
// import materials with maps
THREE.MaterialLoader.prototype._parse = THREE.MaterialLoader.prototype.parse;
THREE.MaterialLoader.prototype.parse = function(a) {
	var b = THREE.MaterialLoader.prototype._parse.apply(this, arguments);
	// texture
	if (a.map) b.map = THREE.Texture.fromJSON(a.map);
	if (a.lightMap) b.lightMap = THREE.Texture.fromJSON(a.lightMap);
	if (a.specularMap) b.specularMap = THREE.Texture.fromJSON(a.specularMap);
	if (a.alphaMap) b.alphaMap = THREE.Texture.fromJSON(a.alphaMap);
	if (a.envMap) b.envMap = THREE.Texture.fromJSON(a.envMap);
	return b;
};
THREE.Texture.prototype.toJSON = function() {
	var output = {};

	output.sourceFile = this.sourceFile;
	if (this.mapping !== THREE.UVMapping) output.mapping = this.mapping;
	if (this.warpS !== THREE.ClampToEdgeWrapping) output.warpS = this.warpS;
	if (this.warpT !== THREE.ClampToEdgeWrapping) output.warpT = this.warpT;
	if (this.magFilter !== THREE.LinearMipMapLinearFilter) output.magFilter = this.magFilter;
	if (this.minFilter !== THREE.LinearMipMapLinearFilter) output.minFilter = this.minFilter;
	if (this.format !== THREE.RGBAFormat) output.format = this.format;
	if (this.type !== THREE.UnsignedByteType) output.type = this.type;
	if (this.anisotropy !== 1) output.anisotropy = this.anisotropy;
	// repeat
	// offset
	if (this.name !== "") output.name = this.name;
	if (this.generateMipmaps !== true) output.generateMipmaps = this.generateMipmaps;
	if (this.flipY !== true) output.flipY = this.flipY;
	return output;
};
THREE.Texture.fromJSON = function(data) {
	var tex = THREE.ImageUtils.loadTexture(data.sourceFile);
	for (var i in data) {
		tex[i] = data[i];
	}
	return tex;
};
