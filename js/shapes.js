shapes = {
	shapes: {},
	blankShape: new Shape('blank',{
		geometry: new THREE.Geometry(),
		collision: new THREE.Geometry()
	}),
	getShape: function(id){
		return this.shapes[id] || this.blankShape;
	},
	addShape: function(){
		this.updateShape.apply(this,arguments);
	},
	updateShape: function(shape){
		if(!(shape instanceof Shape)) return;

		this.shapes[shape.id] = shape;
	},
	removeShape: function(id){
		delete this.shapes[id];
	}
};

function Shape(id,data){
	this.blockData = {};
	for (var i in data) {
		this[i] = data[i];
	}
	this.id = id;
	this.blockData.__proto__ = Block.prototype.data;
	// this.collision.computeFaceNormals();
	for (var k = 0; k < this.geometry.faces.length; k++) {
		this.geometry.faces[k].materialIndex = 0;
	}
	this.geometry.computeFaceNormals();
}
Shape.prototype = {
	id: '',
	name: '',
	// collision: new THREE.Geometry(),
	geometry: new THREE.Geometry(),
	wireFrame: new THREE.Geometry(),
	image: '',
	blockData:{}
};
Shape.prototype.constructor = Shape;
