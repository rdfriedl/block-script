//class for handling and compiling material from material resources
//materials = {
// 	materials: {},
// 	material: undefined,
// 	nullMaterial: 'stone',
// 	lastID: 0,
// 	createID: function(){
// 		return this.lastID++;
// 	},

// 	getMaterial: function(id){
// 		return this.materials[id] || this.getMaterial(this.nullMaterial);
// 	},
// 	getMaterialIndex: function(id){
// 		var mat = this.getMaterial(id)
// 		if(this.material && mat){
// 			return this.material.materials.indexOf(mat.material);
// 		}
// 		return 0; //return 0 since index 0 is the numm material
// 	},
// 	addMaterial: function(id,mat){
// 		this.updateMaterial(id,mat);
// 	},
// 	materialCompiled: function(id){
// 		return !!this.materials[id];
// 	},
// 	updateMaterial: function(id,mat){
// 		this.materials[id] = mat;
// 	},
// 	removeMaterial: function(id){
// 		delete this.materials[id];
// 	},

// 	compileMaterials: function(matArray){
// 		if(!matArray){
// 			matArray = resources.searchResources({},true,'material');
// 		}

// 		for (var i = 0; i < matArray.length; i++) {
// 			matArray[i].compile();
// 		};
// 	},
// 	compileMaterial: function(mat,refresh){ //builds threejs materials from material resoures
// 		if(!(mat instanceof resources.Material)) return;
// 		if(mat.data.materialID == '') return;

// 		if(!this.materialCompiled(mat.data.materialID) || refresh){
// 			//compile it
// 			var matData = mat.data.material;

// 			var material = new Material(mat.data.materialID,{
// 				name: mat.data.name,
// 				resource: mat,
// 				blockData: fn.duplicate(mat.data.blockData)
// 			});

// 			//parse material
// 			if(matData) material.material = materialLoader.parse(matData);

// 			materials.updateMaterial(material.id,material);
// 		}

// 		return this.getMaterial(mat.data.materialID);
// 	},
// 	compile: function(refresh,includeMaterials){ //builds a theejs face material out of all the comiled materials
// 		if(!this.material || refresh){
// 			if(_.isEmpty(this.materials)){
// 				this.compileMaterials();
// 			}
// 			//compile it
// 			var _materials = [];
// 			for (var i in this.materials) {
// 				if(includeMaterials){
// 					if(includeMaterials.indexOf(i) == -1){
// 						continue;
// 					}
// 				}
// 				_materials.push(this.materials[i].material);
// 			};

// 			var mat = new THREE.MeshFaceMaterial(_materials);
// 			this.material = mat;
// 		}

// 		return this.material;
// 	}
// }

function Materials(opts){
	this.materials = [];
	for(var i in opts){
		this[i] = opts[i];
	}
}
Materials.prototype = {
	materials: [],
	material: undefined,
	defaultMaterial: '',

	compile: function(refresh){
		if(!this.material || refresh){
			//compile it
			var _materials = [];
			for (var i in this.materials) {
				_materials.push(this.materials[i].material);
			};

			this.material = new THREE.MeshFaceMaterial(_materials);
		}

		return this.material;
	},
	addMaterial: function(mat,dontUpdate){
		if(!(mat instanceof Material)) throw new Error('material has to be a Material');

		var index = this.materials.push(mat)-1;
		if(!dontUpdate) this.updateMaterial();
		return index;
	},
	removeMaterial: function(index,dontUpdate){ //index can be a index, name, or a Material
		if(typeof index == 'number'){
			//remove material by index
			this.materials.splice(index,1);
			if(!dontUpdate) this.updateMaterial();
			return true;
		}
		else if(index instanceof Material){
			//remove material by material
			if(this.materials.indexOf(index) !== -1){
				this.materials.splice(this.materials.indexOf(index),1);
				if(!dontUpdate) this.updateMaterial();
				return true;
			}
		}
		else if(typeof index == 'string'){
			//remove material by id
			for(var i = 0; i < this.materials.length; i++){
				if(this.materials[i].id == index){
					this.materials.splice(i,1);
					if(!dontUpdate) this.updateMaterial();
					return true;
				}
			}
			//remove material by name
			for(var i = 0; i < this.materials.length; i++){
				if(this.materials[i].name == index){
					this.materials.splice(i,1);
					if(!dontUpdate) this.updateMaterial();
					return true;
				}
			}
		}
		return false;
	},
	getMaterial: function(id){
		//get by id
		for(var i in this.materials){
			if(this.materials[i].id == id){
				return this.materials[i];
			}
		}
		if(this.materials[id]){
			//get by index
			return this.materials[id];
		}
		
		this.getMaterial.warnedIDs = this.getMaterial.warnedIDs || {};
		if(!(id in this.getMaterial.warnedIDs)){
			this.getMaterial.warnedIDs[id] = true;
			console.warn('cant find block with Index or ID: '+id);
		}
		return this.getMaterial(this.defaultMaterial);
	},
	getMaterialIndex: function(mat){
		if(mat instanceof Material){
			return this.material.materials.indexOf(mat.material);
		}
		else if(typeof mat == 'string'){
			mat = this.getMaterial(mat);
			if(mat) return this.material.materials.indexOf(mat.material);
		}
	}
}
Materials.prototype.constructor = Materials;

var lastMaterialID = 0;
function Material(id,mat,blockData){
	this.id = id;
	this.material = mat;
	this.blockData = blockData || {};
	this.blockData.__proto__ = Block.prototype.data;
}
Material.prototype = {
	id: '',
	blockData: {},
	material: undefined //threejs material
}
Object.defineProperties(Material.prototype,{
	materialIndex: {
		get: function(){
			return materials.getMaterialIndex(this);
		}
	}
})
Material.prototype.constructor = Material;