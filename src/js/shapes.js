import THREE from 'three';

let shapes = {
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

export {shapes as default}

import Shape from './shape.js';
