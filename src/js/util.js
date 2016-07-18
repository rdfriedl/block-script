import THREE from 'three';

// URL utils
Blob.fromURL = URL.urlToBlob = function(url){
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState == XMLHttpRequest.DONE){
				if(xhr.status == 200){
					resolve(xhr.response);
				}
				else reject();
			}
		}
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	})
}
Blob.fromDataURI = function(dataURI){
	// NOTE: copied from http://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript

	// convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return Promise.resolve(new Blob([ab],{type: mimeString}));
}
URL.urlToDataURI = function(url){
	return URL.urlToBlob(url).then(blob => {
		return new Promise((resolve) => {
			var reader = new window.FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function() {
				resolve(reader.result);
			}
		})
	});
}
URL.isDataURI = function(url) {
    return (/^data:/).test(url);
}
URL.fromBlob = function(blob){
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	})
}
URL.parseSearch = function(url){
    url = url || location.href;
    URL.parseSearch.cache = URL.parseSearch.cache || {};
    if(!URL.parseSearch.cache[url]){
        var search = url.indexOf('?') !== -1? url.substr(url.indexOf('?')+1,url.length+1) : '';
        var queries = search.replace(/^\?/, '').replace(/\+/g,' ').split('&');
        URL.parseSearch.cache[url] = {};
        for( var i = 0; i < queries.length; i++ ) {
            var split = queries[i].split('=');
            if(split[0] !== '')
            	URL.parseSearch.cache[url][split[0]] = split[1].length? window.unescape(split[1]) : true;
        }
    }
    return URL.parseSearch.cache[url];
}

// JSON utils
JSON.fromBlob = function(blob){
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			// if parsing fails it will throw
			try{
				let json = JSON.parse(reader.result);
				resolve(json);
			}
			catch(e){reject(e)}
		};
		reader.onerror = reject;
		reader.readAsText(blob);
	})
}
JSON.fromURL = function(url){
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState == XMLHttpRequest.DONE){
				if(xhr.status == 200){
					try{
						resolve(JSON.parse(xhr.response));
					}
					catch(e){
						reject(e);
					}
				}
				else reject();
			}
		}
		xhr.open('GET', url);
		xhr.send();
	})
}

// Object
Object.clone = function(obj,deep,ignore){
	if(!obj) return {};

	var clone = new obj.constructor();
	clone.__proto__ = obj.__proto__;

	//copy properties
	for(var i in obj){
		if(ignore && (ignore instanceof Array? ignore.indexOf(i) : i in ignore)) continue;

		//insert classes here
		else if(obj[i] instanceof Date){
			clone[i] = new Date(obj[i]);
		}
		else if(
			obj[i] instanceof THREE.Vector4 ||
			obj[i] instanceof THREE.Vector3 ||
			obj[i] instanceof THREE.Vector2 ||
			obj[i] instanceof THREE.Euler ||
			obj[i] instanceof THREE.Quaternion
		){
			clone[i] = obj[i].clone();
		}
		//fallback
		else if(Object.isObject(obj[i]) && deep){
			clone[i] = Object.clone(obj[i],deep);
		}
		else{
			clone[i] = obj[i];
		}
	}

	return clone;
};
Object.isObject = function (v) {
	return v instanceof Object;
};

// Fuction
Function.isFunction = function (v) {return v instanceof Function};
Function.after = function(times,...functions){
	return () => {
		times--;
		if(times<=0) functions.forEach(f => f());
	}
}
Function.debounce = function(func,time){
	let timeout;
	return function(...args){
		clearTimeout(timeout);
		timeout = setTimeout(function(){
			func(...args);
		},time);
	}
}
Function.noop = function(){};

// String
String.isString = function(v){return v && v.__proto__.constructor === String};
String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
};
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

// Number
Number.isNumber = Number.isFinite;

// Math
Math.lerp = function(min, max, d) {
	var dif = Math.max(min, max) - Math.min(min, max);
	if (min < max)
		return min + dif * d;
	else if (max < min)
		return max + dif * (1 - d);
	else
		return min
};
Math.clamp = function(v,min,max){
	return Math.min(Math.max(v,min),max);
};

// THREE.js
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

THREE.Object3D.prototype.getMaterialById = function(a) {
    return this.getMaterialByProperty("id", a);
};
THREE.Object3D.prototype.getMaterialByName = function(a) {
    return this.getMaterialByProperty("name", a);
};
THREE.Object3D.prototype.getMaterialByProperty = function(a, b) {
	if(this.material){
	    if (this.material[a] === b){
	        return this.material;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getMaterialByProperty(a, b);
        if (void 0 !== e)
            return e;
    }
};

THREE.Object3D.prototype.getTextureById = function(a) {
    return this.getTextureByProperty("id", a);
};
THREE.Object3D.prototype.getTextureByName = function(a) {
    return this.getTextureByProperty("name", a);
};
THREE.Object3D.prototype.getTextureByProperty = function(a, b) {
	if(this.material){
	    if (this.material[a] === b){
	        return this.material;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getTextureByProperty(a, b);
        if (void 0 !== e)
            return e;
    }
};

THREE.Object3D.prototype.getGeometryById = function(a) {
    return this.getGeometryByProperty("id", a);
};
THREE.Object3D.prototype.getGeometryByName = function(a) {
    return this.getGeometryByProperty("name", a);
};
THREE.Object3D.prototype.getGeometryByProperty = function(a, b) {
	if(this.geometry){
	    if (this.geometry[a] === b){
	        return this.geometry;
	    }
	}
    for (var c = 0, d = this.children.length; c < d; c++) {
        var e = this.children[c].getGeometryByProperty(a, b);
        if (void 0 !== e)
            return e;
    }
};
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
};
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
    return b;
};
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
};
THREE.Texture.fromJSON = function(data){
	var tex = THREE.ImageUtils.loadTexture(data.sourceFile);
	for (var i in data) {
		tex[i] = data[i];
	}
	return tex;
};
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
