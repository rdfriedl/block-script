import THREE from 'three';

THREE.EventDispatcher.prototype.dispatchEvent = function(event) {
	if ( this._listeners === undefined ) return;

	var listeners = this._listeners;
	var listenerArray = listeners[ event.type ];

	if ( listenerArray !== undefined ) {
		event.target = event.target || this;

		var array = [], i = 0;
		var length = listenerArray.length;

		for ( i = 0; i < length; i ++ ) {
			array[ i ] = listenerArray[ i ];
		}

		for ( i = 0; i < length; i ++ ) {
			array[ i ].call( this, event );
		}
	}
}

THREE.Vector3.prototype.map = function(fn) {
	this.x = fn(this.x);
	this.y = fn(this.y);
	this.z = fn(this.z);
	return this;
}
