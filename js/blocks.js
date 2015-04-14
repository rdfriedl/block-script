blocks = {
	blocks: {},
	textureFolder: 'res/img/blocks/',
	nullMaterial: new THREE.MeshNormalMaterial(),
	blockMaterial: undefined,
	init: function(){
		var materials = [
			this.nullMaterial
		];

		for (var i in this.blocks) {
			var block = this.blocks[i].prototype;

			if(_.isArray(block.material)){
				for (var k = 0; k < 3; k++) {
					if(!block.material[k]) block.material[k] = [];

					for (var j = 0; j < 2; j++) {
						if(block.material[k][j]){
							if(materials.indexOf(block.material[k][j]) == -1){
								block.material[k][j] = materials.push(block.material[k][j]) -1;
							}
							else{
								block.material[k][j] = materials.indexOf(block.material[k][j]);
							}
						}
						else{
							block.material[k][j] = 0;
						}
					};
				};	
			}
			else{
				var mat = materials.push(block.material) -1;
				block.material = [[mat,mat],[mat,mat],[mat,mat]];
			}
		};
		this.blockMaterial = new THREE.MeshFaceMaterial(materials);
	},
	createBlockFromName: function(name,position,data,chunk){
		if(this.blocks[name]){
			return new this.blocks[name](position,data,chunk);
		}
		else{
			console.error('missing block: '+name);
			return new this.createBlockFromName('Air',position,data,chunk);
		}
	},
	createBlockFromID: function(id,position,data,chunk){
		var k = 0;
		for(var i in this.blocks){
			if(k++ == id){
				return new this.blocks[i](position,data,chunk);
			}
		}
		console.error('missing block with ID: '+id);
		return new this.createBlockFromName('Air',position,data,chunk);
	},
	nameToID: function(name){
		var k = 0;
		for(var i in this.blocks){
			if(i.toLowerCase() == name || i == name){
				return k;
			}
			k++;
		}
		console.error('missing block: '+name)
		return this.nameToID('air')
	},
	IDToName: function(id){
		var k = 0;
		for(var i in this.blocks){
			if(k++ == id){
				return i;
			}
		}
		console.error('missing block with ID: '+id)
		return 'Air';
	},

	addBlock: function(block){
		//block is the init function for the block
		this.blocks[block.name] = block;
	},
	removeBlock: function(block){
		if(this.blocks[block.name]){
			delete this.blocks[block.name];
		}
	},
	extend: function(init,proto,extend){
		extend = extend || this.Block;
		init = init || function(){};

		init.prototype = proto
		init.prototype.__proto__ = extend.prototype;
		init.prototype.constructor = init;

		return init;
	},
	util: {
		textureCache: {},
		loadTexture: function(url,prop){ //texture image is not copied
			var tex;
			if(this.textureCache[url]){
				if(prop){
					tex = this.textureCache[url].clone(this.textureCache[url]);

			        //set the prop
			        for(var i in prop){
			        	tex[i] = prop[i];
			        }
				}
				else{
					tex = this.textureCache[url];
				}
			}
			else{
		       	tex = new THREE.ImageUtils.loadTexture(blocks.textureFolder+url);
		        tex.magFilter = THREE.NearestFilter;
		        tex.minFilter = THREE.LinearMipMapLinearFilter;

		        if(prop){
			        //set the prop
			        for(var i in prop){
			        	tex[i] = prop[i];
			        }
		        }
			}

	        return tex;
		},
		basicMaterialCache: {},
		basicMaterial: function(url,prop,texProp){
			var mat;
			if(this.basicMaterialCache[url]){
				if(prop){
					mat = this.basicMaterialCache[url].clone();

			        //set the prop
			        for(var i in prop){
			        	mat[i] = prop[i];
			        }
				}
				else{
					mat = this.basicMaterialCache[url];
				}
			}
			else{
				mat = this.basicMaterialCache[url] = new THREE.MeshLambertMaterial({
					map: this.loadTexture(url,texProp),
					// wireframe: true,
					// side: THREE.DoubleSide
				});

				if(prop){
			        //set the prop
			        for(var i in prop){
			        	mat[i] = prop[i];
			        }
				}
			}

			return mat;
		}
	}
}


var Block = function(position,data,chunk){
	this.position = position;
	this.chunk = chunk;

	this.inportData(data);
}
Block.prototype = {
	chunk: undefined,
	position: new THREE.Vector3(0,0,0),
	visible: true,

	inportData: function(data){
		//nothing for now
	},
	exportData: function(){
		return {
			id: this.id
		};
	},
	getNeighbor: function(dir){
        var x = this.position.x,
            y = this.position.y,
            z = this.position.z;
        switch(dir){
            case 'x':
                x += 1;
                break;
            case '-x':
                x -= 1;
                break;
            case 'y':
                y += 1;
                break;
            case '-y':
                y -= 1;
                break;
            case 'z':
                z += 1;
                break;
            case '-z':
                z -= 1;
                break;
        }

       	var chunk = this.chunk;
        if(x < 0 || y < 0 || z < 0 || x >= map.chunkSize || y >= map.chunkSize || z >= map.chunkSize){
        	chunk = chunk.getNeighbor(dir);
        	if(!chunk) return; //dont go any futher if we can find the chunk
        }

        if(x < 0) x=9;
        if(y < 0) y=9;
        if(z < 0) z=9;
        if(x >= map.chunkSize) x=0;
		if(y >= map.chunkSize) y=0;
		if(z >= map.chunkSize) z=0;

        return chunk.blocks[positionToIndex(new THREE.Vector3(x,y,z),map.chunkSize)];
	}
}
Object.defineProperties(Block.prototype,{
	worldPosition: {
		get: function(){
			return this.chunk.position.clone().multiplyScalar(map.chunkSize).add(this.position);
		}
	},
    blockUp: {
        get: function(){ return this.getNeighbor('y') },
    },
    blockDown: {
        get: function(){ return this.getNeighbor('-y') },
    },
    blockRight: {
        get: function(){ return this.getNeighbor('x') },
    },
    blockLeft: {
        get: function(){ return this.getNeighbor('-x') },
    },
    blockFoward: {
        get: function(){ return this.getNeighbor('z') },
    },
    blockBack: {
        get: function(){ return this.getNeighbor('-z') },
    },
})
Block.prototype.constructor = Block;

Block.extend = function(init,proto){
	init.prototype = proto || init.prototype;
	init.prototype.__proto__ = this.prototype;
	init.prototype.constructor = init;

	init.extend = this.extend;
	init.add = this.add;
	init.remove = this.remove;

	return init;
}
Block.add = function(){
	blocks.addBlock(this);
	return this;
}
Block.remove = function(){
	blocks.removeBlock(this);
	return this;
}

blocks.Block = Block;