import {
	EventDispatcher,
	AxisHelper,
	BufferGeometry,
	BufferAttribute,
	LineBasicMaterial,
	VertexColors,
	LineSegments,
	Vector2,
	Vector3,
	Vector4,
	GridHelper,
	Color,
	Float32Attribute,
	Material,
	MaterialLoader,
	Texture,
	UVMapping,
	ClampToEdgeWrapping,
	LinearMipMapLinearFilter,
	RGBAFormat,
	UnsignedByteType,
	ImageUtils
} from "three";

EventDispatcher.prototype.dispatchEvent = function(event) {
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

// make it so axis helper can take a Vector3 as first arg
// AxisHelper = function(size) {
// 	if (!(size instanceof Vector3)) size = new Vector3(size || 1, size || 1, size || 1);
//
// 	let vertices = new Float32Array([0, 0, 0, size.x, 0, 0, 0, 0, 0, 0, size.y, 0, 0, 0, 0, 0, 0, size.z]);
//
// 	let colors = new Float32Array([1, 0, 0, 1, 0.6, 0, 0, 1, 0, 0.6, 1, 0, 0, 0, 1, 0, 0.6, 1]);
//
// 	let geometry = new BufferGeometry();
// 	geometry.addAttribute("position", new BufferAttribute(vertices, 3));
// 	geometry.addAttribute("color", new BufferAttribute(colors, 3));
//
// 	let material = new LineBasicMaterial({
// 		vertexColors: VertexColors,
// 	});
//
// 	LineSegments.call(this, geometry, material);
// };
//
// AxisHelper.prototype = Object.create(LineSegments.prototype);
// AxisHelper.prototype.constructor = AxisHelper;

// make it so grid helper can take a Vector2 as the size
// GridHelper = function(size, step, color1, color2) {
// 	color1 = new Color(color1 !== undefined ? color1 : 0x444444);
// 	color2 = new Color(color2 !== undefined ? color2 : 0x888888);
//
// 	let vertices = [];
// 	let colors = [];
//
// 	if (!(size instanceof Vector2)) size = new Vector2(size || 0, size || 0);
//
// 	if (!(step instanceof Vector2)) step = new Vector2(step || 0, step || 0);
//
// 	let offset = 0;
// 	for (let i = -size.x; i <= size.x; i += step.x) {
// 		vertices.push(i, 0, -size.y, i, 0, size.y);
//
// 		let color = i === 0 ? color1 : color2;
//
// 		color.toArray(colors, offset);
// 		offset += 3;
// 		color.toArray(colors, offset);
// 		offset += 3;
// 	}
// 	for (let i = -size.y; i <= size.y; i += step.y) {
// 		vertices.push(-size.x, 0, i, size.x, 0, i);
//
// 		let color = i === 0 ? color1 : color2;
//
// 		color.toArray(colors, offset);
// 		offset += 3;
// 		color.toArray(colors, offset);
// 		offset += 3;
// 	}
//
// 	let geometry = new BufferGeometry();
// 	geometry.addAttribute("position", new Float32Attribute(vertices, 3));
// 	geometry.addAttribute("color", new Float32Attribute(colors, 3));
//
// 	let material = new LineBasicMaterial({
// 		vertexColors: VertexColors,
// 	});
//
// 	LineSegments.call(this, geometry, material);
// };
//
// GridHelper.prototype = Object.create(LineSegments.prototype);
// GridHelper.prototype.constructor = GridHelper;

// fix up vector classes
Vector2.prototype.multiply = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	return this;
};
Vector4.prototype.multiply = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	this.z *= v.z;
	this.w *= v.w;
	return this;
};
Vector2.prototype.divide = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	return this;
};
Vector4.prototype.divide = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	this.z /= v.z;
	this.w /= v.w;
	return this;
};

// vec to / from string
Vector2.prototype.toString = function() {
	return `${this.x},${this.y}`;
};
Vector2.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

Vector3.prototype.toString = function() {
	return `${this.x},${this.y},${this.z}`;
};
Vector3.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

Vector4.prototype.toString = function() {
	return `${this.x},${this.y},${this.z},${this.w}`;
};
Vector4.prototype.fromString = function(str) {
	return this.fromArray(str.split(",").map(v => parseFloat(v)));
};

Vector3.prototype.map = function(fn) {
	this.x = fn(this.x, "x");
	this.y = fn(this.y, "y");
	this.z = fn(this.z, "z");
	return this;
};
Vector3.prototype.sign = function() {
	this.x = Math.sign(this.x);
	this.y = Math.sign(this.y);
	this.z = Math.sign(this.z);
	return this;
};
Vector3.prototype.empty = function() {
	return !this.x && !this.y && !this.z;
};
Vector3.prototype.abs = function() {
	this.x = Math.abs(this.x);
	this.y = Math.abs(this.y);
	this.z = Math.abs(this.z);
	return this;
};

// export maps on materials
Material.prototype._toJSON = Material.prototype.toJSON;
Material.prototype.toJSON = function() {
	var output = Material.prototype._toJSON.apply(this);
	if (this.map) output.map = this.map.toJSON();
	if (this.lightMap) output.lightMap = this.lightMap.toJSON();
	if (this.specularMap) output.specularMap = this.specularMap.toJSON();
	if (this.alphaMap) output.alphaMap = this.alphaMap.toJSON();
	if (this.envMap) output.envMap = this.envMap.toJSON();
	return output;
};
// import materials with maps
MaterialLoader.prototype._parse = MaterialLoader.prototype.parse;
MaterialLoader.prototype.parse = function(a) {
	var b = MaterialLoader.prototype._parse.apply(this, arguments);
	// texture
	if (a.map) b.map = Texture.fromJSON(a.map);
	if (a.lightMap) b.lightMap = Texture.fromJSON(a.lightMap);
	if (a.specularMap) b.specularMap = Texture.fromJSON(a.specularMap);
	if (a.alphaMap) b.alphaMap = Texture.fromJSON(a.alphaMap);
	if (a.envMap) b.envMap = Texture.fromJSON(a.envMap);
	return b;
};
Texture.prototype.toJSON = function() {
	var output = {};

	output.sourceFile = this.sourceFile;
	if (this.mapping !== UVMapping) output.mapping = this.mapping;
	if (this.warpS !== ClampToEdgeWrapping) output.warpS = this.warpS;
	if (this.warpT !== ClampToEdgeWrapping) output.warpT = this.warpT;
	if (this.magFilter !== LinearMipMapLinearFilter) output.magFilter = this.magFilter;
	if (this.minFilter !== LinearMipMapLinearFilter) output.minFilter = this.minFilter;
	if (this.format !== RGBAFormat) output.format = this.format;
	if (this.type !== UnsignedByteType) output.type = this.type;
	if (this.anisotropy !== 1) output.anisotropy = this.anisotropy;
	// repeat
	// offset
	if (this.name !== "") output.name = this.name;
	if (this.generateMipmaps !== true) output.generateMipmaps = this.generateMipmaps;
	if (this.flipY !== true) output.flipY = this.flipY;
	return output;
};
Texture.fromJSON = function(data) {
	var tex = ImageUtils.loadTexture(data.sourceFile);
	for (var i in data) {
		tex[i] = data[i];
	}
	return tex;
};
