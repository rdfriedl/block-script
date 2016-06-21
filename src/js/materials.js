//class for handling and compiling materials
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
			}

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
		if(Number.isNumber(index)){
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
		else if(String.isString(index)){
			//remove material by id
			for(var i = 0; i < this.materials.length; i++){
				if(this.materials[i].id == index){
					this.materials.splice(i,1);
					if(!dontUpdate) this.updateMaterial();
					return true;
				}
			}
			//remove material by name
			for(var k = 0; k < this.materials.length; k++){
				if(this.materials[k].name == index){
					this.materials.splice(k,1);
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
		if(!(id in this.getMaterial.warnedIDs) && id !== undefined){
			this.getMaterial.warnedIDs[id] = true;
			console.warn('cant find block with Index or ID: '+id);
		}
		return this.getMaterial(this.defaultMaterial);
	},
	getMaterialIndex: function(mat){
		if(mat instanceof Material){
			return this.material.materials.indexOf(mat.material);
		}
		else if(String.isString(mat)){
			mat = this.getMaterial(mat);
			if(mat) return this.material.materials.indexOf(mat.material);
		}
	}
};
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
};
Object.defineProperties(Material.prototype,{
	materialIndex: {
		get: function(){
			return materials.getMaterialIndex(this);
		}
	}
});
Material.prototype.constructor = Material;
