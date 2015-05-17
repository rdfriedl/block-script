//class for handling and compiling material from material resources
materials = {
	materials: {},
	material: undefined,
	getMaterial: function(id){
		return this.materials[id];
	},
	getMaterialIndex: function(id){
		var mat = this.getMaterial(id)
		if(this.material && mat){
			return this.material.materials.indexOf(mat.material);
		}
		return 0; //return 0 since index 0 is the numm material
	},
	addMaterial: function(id,mat){
		this.updateMaterial(id,mat);
	},
	updateMaterial: function(id,mat){
		this.materials[id] = mat;
	},
	removeMaterial: function(id){
		delete this.materials[id];
	},

	compileMaterials: function(matArray){
		if(!matArray){
			matArray = resources.searchResources({},true,'material');
		}

		for (var i = 0; i < matArray.length; i++) {
			matArray[i].compile();
		};
	},
	compileMaterial: function(mat,refresh){ //builds threejs materials from material resoures
		if(!(mat instanceof resources.Material)) return;
		if(mat.data.materialID == '') return;

		if(!this.getMaterial(mat.data.materialID) || refresh){
			//compile it
			var matData = mat.data.material;

			var material = new Material(mat.data.materialID,{
				name: mat.data.name,
				resource: mat,
				blockData: fn.duplicate(mat.data.blockData)
			});

			//parse material
			if(matData) material.material = materialLoader.parse(matData);

			materials.updateMaterial(material.id,material);
		}

		return this.getMaterial(mat.data.materialID);
	},
	compile: function(refresh,includeMaterials){ //builds a theejs face material out of all the comiled materials
		if(!this.material || refresh){
			if(_.isEmpty(this.materials)){
				this.compileMaterials();
			}
			//compile it
			var _materials = [];
			for (var i in this.materials) {
				if(includeMaterials){
					if(includeMaterials.indexOf(i) == -1){
						continue;
					}
				}
				_materials.push(this.materials[i].material);
			};

			var mat = new THREE.MeshFaceMaterial(_materials);
			this.material = mat;
		}

		return this.material;
	}
}

function Material(id,data){
	this.blockData = {};
	for (var i in data) {
		this[i] = data[i];
	};
	this.id = id;
	this.blockData.__proto__ = Block.prototype.data;
}
Material.prototype = {
	id: '',
	blockData: {},
	resource: undefined, //the resource that this was compiled from
	material: undefined //threejs material
}
Object.defineProperties(Material.prototype,{
	materialIndex: {
		get: function(){
			return materials.getMaterialIndex(this.id);
		}
	}
})
Material.prototype.constructor = Material;