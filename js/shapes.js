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
}

function Shape(id,data){
	this.blockData = {};
	for (var i in data) {
		this[i] = data[i];
	};
	this.id = id;
	this.blockData.__proto__ = Block.prototype.data;
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
	blockData:{}
}
Shape.prototype.constructor = Shape;

// ----------------- define shapes -------------------
(function(){
var shapeFolder = 'res/modals/shapes/';

var cube = new Shape('cube',{
	name: 'Cube',
	geometry: new THREE.BoxGeometry(1, 1, 1),
	collision: new THREE.BoxGeometry(1, 1, 1),
	blockData: {
		canRotate: false,
	}
});
shapes.addShape(cube);

var halfCube = new Shape('halfCube',{
	name: 'Half Cube',
	geometry: loadShape(shapeFolder+'halfCube.dae'),
	collision: loadShape(shapeFolder+'halfCube.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(halfCube);

var slant = new Shape('slant',{
	name: 'Slant',
	geometry: loadShape(shapeFolder+'slant.dae'),
	collision: loadShape(shapeFolder+'slant.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(slant);

var slantCornerIn = new Shape('slantCornerIn',{
	name: 'Slant Corner In',
	geometry: loadShape(shapeFolder+'slantCornerIn.dae'),
	collision: loadShape(shapeFolder+'slantCornerIn.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(slantCornerIn);

var slantCornerOut = new Shape('slantCornerOut',{
	name: 'Slant Corner Out',
	geometry: loadShape(shapeFolder+'slantCornerOut.dae'),
	collision: loadShape(shapeFolder+'slantCornerOut.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(slantCornerOut);

var halfSlant = new Shape('halfSlant',{
	name: 'Half Slant',
	geometry: loadShape(shapeFolder+'halfSlant.dae'),
	collision: loadShape(shapeFolder+'halfSlant.dae'),
	transparent: true
});
shapes.addShape(halfSlant);

var halfSlantCornerIn = new Shape('halfSlantCornerIn',{
	name: 'Half Slant Corner In',
	geometry: loadShape(shapeFolder+'halfSlantCornerIn.dae'),
	collision: loadShape(shapeFolder+'halfSlantCornerIn.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(halfSlantCornerIn);

var halfSlantCornerOut = new Shape('halfSlantCornerOut',{
	name: 'Half Slant Corner Out',
	geometry: loadShape(shapeFolder+'halfSlantCornerOut.dae'),
	collision: loadShape(shapeFolder+'halfSlantCornerOut.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(halfSlantCornerOut);

var stairs = new Shape('stairs',{
	name: 'Stairs',
	geometry: loadShape(shapeFolder+'stairs.dae'),
	collision: loadShape(shapeFolder+'stairs.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairs);

var stairsCornerIn = new Shape('stairsCornerIn',{
	name: 'Stairs Corner In',
	geometry: loadShape(shapeFolder+'stairsCornerIn.dae'),
	collision: loadShape(shapeFolder+'stairsCornerIn.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairsCornerIn);

var stairsCornerOut = new Shape('stairsCornerOut',{
	name: 'Stairs Corner Out',
	geometry: loadShape(shapeFolder+'stairsCornerOut.dae'),
	collision: loadShape(shapeFolder+'stairsCornerOut.dae'),
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairsCornerOut);


})()