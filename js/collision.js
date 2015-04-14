CollisionEntity = function(data){
	data = data || {};
	this._box = data.box || new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	this.position = data.position || new THREE.Vector3();
	this.children = data.children || [];
	this.group = data.group || this.group;
}
CollisionEntity.prototype = {
	group: 'none',
	children: [],
	_box: undefined,
	position: undefined,
	collide: function(collisionEntity){
		return collisions.collide(this,collisionEntity);
	}
}
Object.defineProperties(CollisionEntity.prototype,{
	box: {
		get: function(){
			return this._box.clone().translate(this.position);
		}
	},
	x: {
		get: function(){
			return this.position.x;
		},
		set: function(val){
			return this.position.x = val;
		}
	},
	y: {
		get: function(){
			return this.position.y;
		},
		set: function(val){
			return this.position.y = val;
		}
	},
	z: {
		get: function(){
			return this.position.z;
		},
		set: function(val){
			return this.position.z = val;
		}
	},
	x1: {
		get: function(){
			return this.box.min.x;
		}
	},
	x2: {
		get: function(){
			return this.box.max.x;
		}
	},
	y1: {
		get: function(){
			return this.box.min.y;
		}
	},
	y2: {
		get: function(){
			return this.box.max.y;
		}
	},
	z1: {
		get: function(){
			return this.box.min.z;
		}
	},
	z2: {
		get: function(){
			return this.box.max.z;
		}
	},
	width: {
		get: function(){
			return this._box.max.x - this._box.min.x;
		}
	},
	height: {
		get: function(){
			return this._box.max.y - this._box.min.y;
		}
	},
	depth: {
		get: function(){
			return this._box.max.z - this._box.min.z;
		}
	}
})

dimensions = [Infinity, Infinity, Infinity];
offset = [-Infinity, -Infinity, -Infinity];

collisions = {
	groups: {
		none: [],
		player: ['block'],
		block: []
	},
	canCollide: function(a,b){
		if(this.gorups[a.group]){
			return this.groups[a.group].indexOf(b.group) !== -1;
		}
		return false;
	},
    SweptAABB: function(a, b, to){
    	var normal = new THREE.Vector3();
        var invEntry = new THREE.Vector3();
        var invExit = new THREE.Vector3();

        // find the distance between the objects on the near and far sides for both x and y
        if(to.x > 0){
            invEntry.x = b.x1 - a.x2;
            invExit.x = b.x2 - a.x1;
        }
        else{
            invEntry.x = b.x2 - a.x1;
            invExit.x = b.x1 - a.x2;
        }

        if(to.y > 0){
            invEntry.y = b.y1 - a.y2;
            invExit.y = b.y2 - a.y1;
        }
        else{
            invEntry.y = b.y2 - a.y1;
            invExit.y = b.y1 - a.y2;
        }

        if(to.z > 0){
            invEntry.z = b.z1 - a.z2;
            invExit.z = b.z2 - a.z1;
        }
        else{
            invEntry.z = b.z2 - a.z1;
            invExit.z = b.z1 - a.z2;
        }

        // find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
        var entry = new THREE.Vector3();
        var exit = new THREE.Vector3();

        if (to.x == 0){
            entry.x = -Infinity;
            exit.x = Infinity;
        }
        else{
            entry.x = invEntry.x / to.x;
            exit.x = invExit.x / to.x;
        }

        if (to.y == 0){
            entry.y = -Infinity;
            exit.y = Infinity;
        }
        else{
            entry.y = invEntry.y / to.y;
            exit.y = invExit.y / to.y;
        }

        if (to.z == 0){
            entry.z = -Infinity;
            exit.z = Infinity;
        }
        else{
            entry.z = invEntry.z / to.z;
            exit.z = invExit.z / to.z;
        }

        // find the earliest/latest times of collision
        var entryTime = Math.max(entry.x, entry.y, entry.z);
        var exitTime = Math.min(exit.x, exit.y, exit.z);

        // if there was no collision
        if(entryTime > exitTime || entryTime > 1){ //return if the entryTime is > 1 becuase we dont want to go further then we want to
            return {
            	entryTime: 1,
            	exitTime: Infinity,
            	normal: normal,
            	invEntry: invEntry,
            	invExit: invExit,
            	entry: entry,
            	exit: exit
            };
        }
        else{ // if there was a collision
            // calculate normal of collided surface
            if(entry.y > entry.x && entry.y > entry.z){
                normal.x = 0;
                normal.y = 1;//(invEntry.y < 0)? 1 : -1;
                normal.z = 0;
            }
            else if(entry.x > entry.y && entry.x > entry.z){
                normal.x = 1;//(invEntry.x < 0)? 1 : -1;
                normal.y = 0;
                normal.z = 0;
            }
            else if(entry.z > entry.x && entry.z > entry.y){
                normal.x = 0;
                normal.y = 0;
                normal.z = 1;//(invEntry.z < 0)? 1 : -1;
            }
            else{ //looks like two sides collided at the same time
            	
            }

            // return the time of collision
            return {
            	entryTime: entryTime,
            	exitTime: exitTime,
            	normal: normal,
            	invEntry: invEntry,
            	invExit: invExit,
            	entry: entry,
            	exit: exit
            };
        }
    }
}