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
function loadShape(url,name){
	name = name || "SHAPE";
	var geometry = new THREE.Geometry();
	var loader = new THREEx.UniversalLoader()
	loader.load(url, function(obj){
		var obj = obj.getObjectByName(name);
		var geo = obj.getGeometryByName('');

		if(geo){
			geometry.vertices = geo.vertices;
			geometry.verticesNeedUpdate = true;

			geometry.faces = geo.faces;
			geometry.faceVertexUvs = geo.faceVertexUvs;

			geometry.colors = geo.colors;
			geometry.colorsNeedUpdate = true;
		}
	})
	return geometry;
}
THREE.Vector3.prototype.sign = function(){
	Math.sign(this.x);
	Math.sign(this.y);
	Math.sign(this.z);
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