shapes = {
	shapes: {},
	getShape: function(id){
		return this.shapes[id];
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
}

function Shape(id,data){
	for (var i in data) {
		this[i] = data[i];
	};
	this.id = id;
	if(this.collider) this.collider.computeFaceNormals();
	if(this.geometry){
		for (var i = 0; i < this.geometry.faces.length; i++) {
			this.geometry.faces[i].materialIndex = 0;
		};
		this.geometry.computeFaceNormals();
	}
}
Shape.prototype = {
	id: '',
	name: '',
	collision: undefined,
	geometry: undefined,
	transparent: false
}
Shape.prototype.constructor = Shape;

// ----------------- define shapes -------------------
(function(){
var shapeFolder = 'res/modals/shapes/';

var cube = new Shape('cube',{
	name: 'Cube',
	geometry: new THREE.BoxGeometry(1, 1, 1),
	collision: new THREE.BoxGeometry(1, 1, 1)
});
shapes.addShape(cube);

var sphere = new Shape('sphere',{
	name: 'Sphere',
	geometry: new THREE.SphereGeometry(0.5, 10, 10),
	collision: new THREE.SphereGeometry(0.5, 10, 10),
	transparent: true
});
shapes.addShape(sphere);

var rightTriangle = new Shape('rightTriangle',{
	name: 'Right Triangle',
	geometry: loadShape(shapeFolder+'rightTriangle.dae'),
	collision: loadShape(shapeFolder+'rightTriangle.dae'),
	transparent: true
});
shapes.addShape(rightTriangle);


})()