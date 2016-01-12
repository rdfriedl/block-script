(function(){
var shapeFolder = 'res/modals/shapes/';

var loadShapeCache = {};
function loadShape(url,name){
	name = name || "Shape";
	var geometry;

	var func = function(data,name){
		//get the geometry
		var obj = data.getObjectByName(name);
		if(obj){
			var geo = obj.getGeometryByName('');

			if(geo) return geo;
		}
		return new THREE.Geometry();
	};

	//create loader
	if(!loadShapeCache[url]){
		var loader = new THREEx.UniversalLoader();
		loadShapeCache[url] = {
			loader: loader,
			geometries: {}
		};
		loader.load(url, function(url,data){
			for (var i in loadShapeCache[url].geometries) {
				var geo = func(data,i);
				var geometry = loadShapeCache[url].geometries[i];

				geometry.vertices = geo.vertices;
				geometry.verticesNeedUpdate = true;

				geometry.faces = geo.faces;
				geometry.faceVertexUvs = geo.faceVertexUvs;

				geometry.colors = geo.colors;
				geometry.colorsNeedUpdate = true;

				geometry.computeFaceNormals();
			}
		}.bind(this,url));
	}

	//add geometry to the list
	if(!loadShapeCache[url].geometries[name]){
		geometry = loadShapeCache[url].geometries[name] = new THREE.Geometry();
	}
	else{
		geometry = loadShapeCache[url].geometries[name];
	}
	return geometry;
}

var cube = new Shape('cube',{
	name: 'Cube',
	geometry: loadShape(shapeFolder+'cube.dae','Shape'),//new THREE.BoxGeometry(1, 1, 1),
	// collision: new THREE.BoxGeometry(1, 1, 1),
	wireFrame: loadShape(shapeFolder+'cube.dae','WireFrame'),
	image: 'res/img/shapes/cube.png',
	blockData: {
		canRotate: false,
	}
});
shapes.addShape(cube);

var halfCube = new Shape('halfCube',{
	name: 'Half Cube',
	geometry: loadShape(shapeFolder+'halfCube.dae','Shape'),
	// collision: loadShape(shapeFolder+'halfCube.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'halfCube.dae','WireFrame'),
	image: 'res/img/shapes/halfCube.png',
	blockData: {
		transparent: true,
		canRotateOnY: false
	}
});
shapes.addShape(halfCube);

var slant = new Shape('slant',{
	name: 'Slant',
	geometry: loadShape(shapeFolder+'slant.dae','Shape'),
	// collision: loadShape(shapeFolder+'slant.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'slant.dae','WireFrame'),
	image: 'res/img/shapes/slant.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(slant);

var slantCornerIn = new Shape('slantCornerIn',{
	name: 'Slant Corner In',
	geometry: loadShape(shapeFolder+'slantCornerIn.dae','Shape'),
	// collision: loadShape(shapeFolder+'slantCornerIn.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'slantCornerIn.dae','WireFrame'),
	image: 'res/img/shapes/slantCornerIn.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(slantCornerIn);

var slantCornerOut = new Shape('slantCornerOut',{
	name: 'Slant Corner Out',
	geometry: loadShape(shapeFolder+'slantCornerOut.dae','Shape'),
	// collision: loadShape(shapeFolder+'slantCornerOut.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'slantCornerOut.dae','WireFrame'),
	image: 'res/img/shapes/slantCornerOut.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(slantCornerOut);

var halfSlant = new Shape('halfSlant',{
	name: 'Half Slant',
	geometry: loadShape(shapeFolder+'halfSlant.dae','Shape'),
	// collision: loadShape(shapeFolder+'halfSlant.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'halfSlant.dae','WireFrame'),
	image: 'res/img/shapes/halfSlant.png',
	blockData:{
		transparent: true
	}
});
shapes.addShape(halfSlant);

var halfSlantCornerIn = new Shape('halfSlantCornerIn',{
	name: 'Half Slant Corner In',
	geometry: loadShape(shapeFolder+'halfSlantCornerIn.dae','Shape'),
	// collision: loadShape(shapeFolder+'halfSlantCornerIn.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'halfSlantCornerIn.dae','WireFrame'),
	image: 'res/img/shapes/halfSlantCornerIn.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(halfSlantCornerIn);

var halfSlantCornerOut = new Shape('halfSlantCornerOut',{
	name: 'Half Slant Corner Out',
	geometry: loadShape(shapeFolder+'halfSlantCornerOut.dae','Shape'),
	// collision: loadShape(shapeFolder+'halfSlantCornerOut.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'halfSlantCornerOut.dae','WireFrame'),
	image: 'res/img/shapes/halfSlantCornerOut.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(halfSlantCornerOut);

var stairs = new Shape('stairs',{
	name: 'Stairs',
	geometry: loadShape(shapeFolder+'stairs.dae','Shape'),
	// collision: loadShape(shapeFolder+'stairs.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'stairs.dae','WireFrame'),
	image: 'res/img/shapes/stairs.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairs);

var stairsCornerIn = new Shape('stairsCornerIn',{
	name: 'Stairs Corner In',
	geometry: loadShape(shapeFolder+'stairsCornerIn.dae','Shape'),
	// collision: loadShape(shapeFolder+'stairsCornerIn.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'stairsCornerIn.dae','WireFrame'),
	image: 'res/img/shapes/stairsCornerIn.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairsCornerIn);

var stairsCornerOut = new Shape('stairsCornerOut',{
	name: 'Stairs Corner Out',
	geometry: loadShape(shapeFolder+'stairsCornerOut.dae','Shape'),
	// collision: loadShape(shapeFolder+'stairsCornerOut.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'stairsCornerOut.dae','WireFrame'),
	image: 'res/img/shapes/stairsCornerOut.png',
	blockData: {
		transparent: true
	}
});
shapes.addShape(stairsCornerOut);

var cone = new Shape('cone',{
	name: 'Cone',
	geometry: loadShape(shapeFolder+'cone.dae','Shape'),
	// collision: loadShape(shapeFolder+'cone.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'cone.dae','WireFrame'),
	image: 'res/img/shapes/cone.png',
	blockData: {
		transparent: true,
		canRotateOnY: false
	}
});
shapes.addShape(cone);

var halfCone = new Shape('halfCone',{
	name: 'Half Cone',
	geometry: loadShape(shapeFolder+'halfCone.dae','Shape'),
	// collision: loadShape(shapeFolder+'halfCone.dae','Shape'),
	wireFrame: loadShape(shapeFolder+'halfCone.dae','WireFrame'),
	image: 'res/img/shapes/halfCone.png',
	blockData: {
		transparent: true,
		canRotateOnY: false
	}
});
shapes.addShape(halfCone);

})();
