function observable(val, cb) {
	o = ko.observable(val);
	o.subscribe(cb, o);
	return o;
}
function namedFunction(name, fn) {
    return (new Function("return function (call) { return function " + name +
        " () { return call(this, arguments) }; };")())(Function.apply.bind(fn));
}
function positionToIndex(position,size){
	if(size instanceof THREE.Vector3){
		return (position.z*size.x*size.y)+(position.y*size.x)+position.x;
	}
	else return (position.z*size*size)+(position.y*size)+position.x;
}
function indexToPosition(index,size){
	var position = new THREE.Vector3(0,0,0);
	if(size instanceof THREE.Vector3){
		position.z = Math.floor(index/(size.x*size.y));
		position.y = Math.floor((index-(position.z*(size.x*size.y)))/size.x);
		position.x = index-(position.y*size.x)-(position.z*size.x*size.y);
	}
	else{
		position.z = Math.floor(index/(size*size));
		position.y = Math.floor((index-(position.z*(size*size)))/size);
		position.x = index-(position.y*size)-(position.z*size*size);
	}
	return position;
}
function observable(val,cb){
	o = ko.observable(val);
	o.subscribe(cb);
	return o;
}
function loadTexture(url,prop,dontmap){ //texture image is not copied
	var tex = new THREE.ImageUtils.loadTexture(url);
   	if(!dontmap){
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.LinearMipMapLinearFilter;
    }

    if(prop){
        //set the prop
        for(var i in prop){
        	tex[i] = prop[i];
        }
    }

    return tex;
}
function basicMaterial(url,prop,texProp){
	var mat = new THREE.MeshLambertMaterial({
		map: loadTexture(url,texProp),
		reflectivity: 0
	});

	if(prop){
        //set the prop
        for(var i in prop){
        	mat[i] = prop[i];
        }
	}

	return mat;
}
loadShapeCache = {};
function loadShape(url,name){
	name = name || "Shape";
	var geometry;

	var func = function(data,name){
		//get the geometry
		var obj = data.getObjectByName(name);
		if(obj){
			var geo = obj.getGeometryByName('');

			if(geo) return geo;
		}
		return new THREE.Geometry();
	}

	//create loader
	if(!loadShapeCache[url]){
		var loader = new THREEx.UniversalLoader();
		loadShapeCache[url] = {
			loader: loader,
			geometries: {}
		}
		loader.load(url, function(url,data){
			for (var i in loadShapeCache[url].geometries) {
				var geo = func(data,i);
				var geometry = loadShapeCache[url].geometries[i];

				geometry.vertices = geo.vertices;
				geometry.verticesNeedUpdate = true;

				geometry.faces = geo.faces;
				geometry.faceVertexUvs = geo.faceVertexUvs;

				geometry.colors = geo.colors;
				geometry.colorsNeedUpdate = true;

				geometry.computeFaceNormals();
			};
		}.bind(this,url))
	}
	
	//add geometry to the list
	if(!loadShapeCache[url].geometries[name]){
		geometry = loadShapeCache[url].geometries[name] = new THREE.Geometry();
	}
	else{
		geometry = loadShapeCache[url].geometries[name];
	}
	return geometry;
}
THREE.Vector3.prototype.sign = function(){
	this.x = Math.sign(this.x);
	this.y = Math.sign(this.y);
	this.z = Math.sign(this.z);
	return this;
}
THREE.Vector3.prototype.empty = function(){
	return !this.x && !this.y && !this.z;
}
THREE.Vector3.prototype.split = function(dirs){
	if(!dirs){
		//4
		var a = [];
		if(this.x!==0) a.push(new THREE.Vector3(this.x,0,0));
		if(this.y!==0) a.push(new THREE.Vector3(0,this.y,0));
		if(this.z!==0) a.push(new THREE.Vector3(0,0,this.z));
		return a;
	}
	else{
		//8
	}
}
THREE.Vector3.prototype.toString = function(){
	return this.x+'|'+this.y+'|'+this.z;
}
THREE.Vector3.prototype.fromString = function(str){
	return this.fromArray(str.split('|'));
}

THREE.Object3D.prototype.getMaterialById = function(a) {
    return this.getMaterialByProperty("id", a)
},
THREE.Object3D.prototype.getMaterialByName = function(a) {
    return this.getMaterialByProperty("name", a)
},
THREE.Object3D.prototype.getMaterialByProperty = function(a, b) {
	if(this.material){
	    if (this.material[a] === b){
	        return this.material;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getMaterialByProperty(a, b);
        if (void 0 !== e)
            return e
    }
}

THREE.Object3D.prototype.getTextureById = function(a) {
    return this.getTextureByProperty("id", a)
},
THREE.Object3D.prototype.getTextureByName = function(a) {
    return this.getTextureByProperty("name", a)
},
THREE.Object3D.prototype.getTextureByProperty = function(a, b) {
	if(this.material){
	    if (this.material[a] === b){
	        return this.material;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getTextureByProperty(a, b);
        if (void 0 !== e)
            return e
    }
}

THREE.Object3D.prototype.getGeometryById = function(a) {
    return this.getGeometryByProperty("id", a)
},
THREE.Object3D.prototype.getGeometryByName = function(a) {
    return this.getGeometryByProperty("name", a)
},
THREE.Object3D.prototype.getGeometryByProperty = function(a, b) {
	if(this.geometry){
	    if (this.geometry[a] === b){
	        return this.geometry;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getGeometryByProperty(a, b);
        if (void 0 !== e)
            return e
    }
}
//export maps on materials
THREE.Material.prototype._toJSON = THREE.Material.prototype.toJSON;
THREE.Material.prototype.toJSON = function(){
	var output = THREE.Material.prototype._toJSON.apply(this);
	if(this.map) output.map = this.map.toJSON();
	if(this.lightMap) output.lightMap = this.lightMap.toJSON();
	if(this.specularMap) output.specularMap = this.specularMap.toJSON();
	if(this.alphaMap) output.alphaMap = this.alphaMap.toJSON();
	if(this.envMap) output.envMap = this.envMap.toJSON();
	return output;
}
//inport materials with maps
THREE.MaterialLoader.prototype._parse = THREE.MaterialLoader.prototype.parse;
THREE.MaterialLoader.prototype.parse = function(a) {
	var b = THREE.MaterialLoader.prototype._parse.apply(this,arguments);
   	//texture
   	if(a.map) b.map = THREE.Texture.fromJSON(a.map);
	if(a.lightMap) b.lightMap = THREE.Texture.fromJSON(a.lightMap);
	if(a.specularMap) b.specularMap = THREE.Texture.fromJSON(a.specularMap);
	if(a.alphaMap) b.alphaMap = THREE.Texture.fromJSON(a.alphaMap);
	if(a.envMap) b.envMap = THREE.Texture.fromJSON(a.envMap);
    return b
}
THREE.Texture.prototype.toJSON = function(){
	var output = {};

	output.sourceFile = this.sourceFile;
	if(this.mapping !== THREE.UVMapping) output.mapping = this.mapping;
	if(this.warpS !== THREE.ClampToEdgeWrapping) output.warpS = this.warpS;
	if(this.warpT !== THREE.ClampToEdgeWrapping) output.warpT = this.warpT;
	if(this.magFilter !== THREE.LinearMipMapLinearFilter) output.magFilter = this.magFilter;
	if(this.minFilter !== THREE.LinearMipMapLinearFilter) output.minFilter = this.minFilter;
	if(this.format !== THREE.RGBAFormat) output.format = this.format;
	if(this.type !== THREE.UnsignedByteType) output.type = this.type;
	if(this.anisotropy !== 1) output.anisotropy = this.anisotropy;
	//repeat
	//offset
	if(this.name !== '') output.name = this.name;
	if(this.generateMipmaps !== true) output.generateMipmaps = this.generateMipmaps;
	if(this.flipY !== true) output.flipY = this.flipY;
	return output;
}
THREE.Texture.fromJSON = function(data){
	var tex = THREE.ImageUtils.loadTexture(data.sourceFile);
	for (var i in data) {
		tex[i] = data[i];
	};
	return tex;
}
function createDebugBox(size){
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 72 ), 3 ) );
	var mesh = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000 } ), THREE.LinePieces);

	var min = size.clone().divideScalar(2).multiplyScalar(-1);
	var max = size.clone().divideScalar(2);

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

	var vertices = mesh.geometry.attributes.position.array;

	vertices[  0 ] = max.x; vertices[  1 ] = max.y; vertices[  2 ] = max.z;
	vertices[  3 ] = min.x; vertices[  4 ] = max.y; vertices[  5 ] = max.z;

	vertices[  6 ] = min.x; vertices[  7 ] = max.y; vertices[  8 ] = max.z;
	vertices[  9 ] = min.x; vertices[ 10 ] = min.y; vertices[ 11 ] = max.z;

	vertices[ 12 ] = min.x; vertices[ 13 ] = min.y; vertices[ 14 ] = max.z;
	vertices[ 15 ] = max.x; vertices[ 16 ] = min.y; vertices[ 17 ] = max.z;

	vertices[ 18 ] = max.x; vertices[ 19 ] = min.y; vertices[ 20 ] = max.z;
	vertices[ 21 ] = max.x; vertices[ 22 ] = max.y; vertices[ 23 ] = max.z;

	//

	vertices[ 24 ] = max.x; vertices[ 25 ] = max.y; vertices[ 26 ] = min.z;
	vertices[ 27 ] = min.x; vertices[ 28 ] = max.y; vertices[ 29 ] = min.z;

	vertices[ 30 ] = min.x; vertices[ 31 ] = max.y; vertices[ 32 ] = min.z;
	vertices[ 33 ] = min.x; vertices[ 34 ] = min.y; vertices[ 35 ] = min.z;

	vertices[ 36 ] = min.x; vertices[ 37 ] = min.y; vertices[ 38 ] = min.z;
	vertices[ 39 ] = max.x; vertices[ 40 ] = min.y; vertices[ 41 ] = min.z;

	vertices[ 42 ] = max.x; vertices[ 43 ] = min.y; vertices[ 44 ] = min.z;
	vertices[ 45 ] = max.x; vertices[ 46 ] = max.y; vertices[ 47 ] = min.z;

	//

	vertices[ 48 ] = max.x; vertices[ 49 ] = max.y; vertices[ 50 ] = max.z;
	vertices[ 51 ] = max.x; vertices[ 52 ] = max.y; vertices[ 53 ] = min.z;

	vertices[ 54 ] = min.x; vertices[ 55 ] = max.y; vertices[ 56 ] = max.z;
	vertices[ 57 ] = min.x; vertices[ 58 ] = max.y; vertices[ 59 ] = min.z;

	vertices[ 60 ] = min.x; vertices[ 61 ] = min.y; vertices[ 62 ] = max.z;
	vertices[ 63 ] = min.x; vertices[ 64 ] = min.y; vertices[ 65 ] = min.z;

	vertices[ 66 ] = max.x; vertices[ 67 ] = min.y; vertices[ 68 ] = max.z;
	vertices[ 69 ] = max.x; vertices[ 70 ] = min.y; vertices[ 71 ] = min.z;

	mesh.geometry.attributes.position.needsUpdate = true;

	mesh.geometry.computeBoundingSphere();

	// mesh.matrix = object.matrixWorld;
	// mesh.matrixAutoUpdate = false;
	return mesh;
}

//pollyfill for function names in IE
if (!(function f() {}).name) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function() {
            var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
            // For better performance only parse once, and then cache the
            // result through a new accessor for repeated access.
            Object.defineProperty(this, 'name', { value: name });
            return name;
        }
    });
}

function InstancePool(type,context,dontUseActiveArray){
	this.type = type || "Object";
	this.context = context || window;
	this.dontUseActiveArray = dontUseActiveArray || false;

	this.inUse = [];
	this.notUsed = [];
}
InstancePool.prototype = {
	context: window,
	type: '',
	inUse: [],
	notUsed: [],
	dontUseActiveArray: false,
	allocate: function(){
		var obj;
		if(this.notUsed.length > 0){
			obj = this.notUsed.pop();
		}
		else{
			obj = new this.context[this.type]();
		}
		if(!this.dontUseActiveArray) this.inUse.push(obj);
		obj.__proto__.constructor.apply(obj,arguments);
		return obj;
	},
	preAllocate: function(number){
		//create # of objects
		for (var i = 0; i < number; i++) {
			this.notUsed.push(new this.context[this.type]());
		};
	},
	free: function(obj){
		if(!this.dontUseActiveArray){
			var index = this.inUse.indexOf(obj);
			if(index !== -1){
				this.inUse.splice(index,1);
			}
		}
		this.notUsed.push(obj);
	}
}