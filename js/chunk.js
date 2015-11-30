Chunk = function(position,map){
    this.blocks = [];
    this.position = position;
    this.map = map;
    this.arrayBuffer = new ArrayBuffer(game.chunkSize*game.chunkSize*game.chunkSize*32*8);

    this.events = new Events();

    this.group = new THREE.Group();
    this.group.position.copy(this.scenePosition);
    this.map.group.add(this.group);

    this.debugGroup = new THREE.Group();
    this.debugGroup.position.copy(this.scenePosition);
    // this.map.debugGroup.add(this.debugGroup); dont add it yet

    this.collisionGroup = new THREE.Group();
    this.collisionGroup.position.copy(this.scenePosition);
    this.map.collisionGroup.add(this.collisionGroup);

    this.wireframe = createDebugBox(new THREE.Vector3(1,1,1));
    this.wireframe.position.set(0.5,0.5,0.5).multiplyScalar(game.chunkSize).multiplyScalar(game.blockSize);
    this.wireframe.scale.multiplyScalar(game.chunkSize).multiplyScalar(game.blockSize);
    this.debugGroup.add(this.wireframe);
}
Chunk.prototype = {
    blocks: [],
    position: new THREE.Vector3(),

    loading: false,
    saving: false,
    saved: true,
    
    mesh: undefined,
    collisionMesh: undefined,
    group: undefined,
    debugGroup: undefined,
    collisionGroup: undefined,
    map: undefined,
    events: undefined,
    /*
    export
    inport
    build
    blockChange
    */
    setBlock: function(position,data,dontBuild){
        if(!data) return this.removeBlock(position,dontBuild);

        var oldBlock;
        var index = (position instanceof THREE.Vector3)? positionToIndex(position,game.chunkSize) : position;
        var pos = (position instanceof THREE.Vector3)? position : indexToPosition(position,game.chunkSize);

        //dispose of the old block
        if(this.blocks[index]){
            oldBlock = this.blocks[index];
            this.blocks[index].dispose();
        }

        // var block = new Block(pos,data,this);
        var block = blockPool.allocate(pos,data,this);
        this.blocks[index] = block;

        if(!dontBuild){
            this.build()
        }

        this.events.emit('blockChange',{
            block: block,
            from: oldBlock
        })

        return block;
    },
    removeBlock: function(position,dontBuild){
        var oldBlock;
        var index = (position instanceof THREE.Vector3)? positionToIndex(position,game.chunkSize) : position;

        //dispose of the old block
        if(this.blocks[index]){
            oldBlock = this.blocks[index];
            this.blocks[index].dispose();
        }

        this.blocks[index] = undefined;

        if(!dontBuild){
            this.build()
        }

        this.events.emit('blockRemove',{
            block: oldBlock
        })
    },
    getBlock: function(position){
        return this.blocks[positionToIndex(position,game.chunkSize)];
    },

    inportData: function(data){ //data is a array of blocks
        data = data || [];

        for (var i = 0; i < data.length; i++) {
            this.setBlock(i,data[i],true);
        };
        this.events.emit('inport',data);
        this.build();

        if(this.blocks.length !== game.chunkSize * game.chunkSize * game.chunkSize){
            console.error('not all blocks inported: '+this.position.toString()+' ('+this.blocks.length+')');
        }
    },
    exportData: function(){
        //going to have to loop through block array and export each one
        var data = [];
        for (var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i] instanceof Block){
                data.push(this.blocks[i].exportData());
            }
            else{
                data.push(undefined);
            }
        };
        this.events.emit('export',data);
        return data;
    },
    build: function(){
        try{
            if(this.mesh){
                this.mesh.geometry.dispose();
                this.group.remove(this.mesh);
            }
            if(this.collisionMesh){
                this.collisionMesh.geometry.dispose();
                this.collisionGroup.remove(this.collisionMesh);
            }

            if(this.empty){
                this.map.group.remove(this.group);
                this.map.debugGroup.remove(this.debugGroup);
                this.map.collisionGroup.remove(this.collisionGroup);
                return
            }
            else{
                this.map.group.add(this.group);
                this.map.debugGroup.add(this.debugGroup);
                this.map.collisionGroup.add(this.collisionGroup);
            }

            var geometry = new THREE.Geometry();
            var material = materials.compile();
            var collisionMaterial = new THREE.MeshBasicMaterial({
                wireframe: true
            });

            //loop though blocks and add them
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];
                if(block){
                    var pos = block.position.clone().add(new THREE.Vector3(0.5,0.5,0.5));
                    var matrix = new THREE.Matrix4();
                    matrix.makeRotationFromEuler(block.rotation);
                    matrix.setPosition(pos);

                    //mesh
                    if(block.visible && block.material && block.shape){
                        geometry.merge(block.shape.geometry,matrix,block.material.materialIndex);
                    }
                }
            };

            geometry.mergeVertices();
            geometry.computeFaceNormals();

            this.mesh = new THREE.Mesh(geometry,material);
            this.mesh.scale.multiplyScalar(game.blockSize);
            this.group.add(this.mesh);

            this.collisionMesh = new THREE.Mesh(geometry,collisionMaterial);
            this.collisionMesh.scale.multiplyScalar(game.blockSize);
            this.collisionGroup.add(this.collisionMesh);
        }
        catch(e){
            console.error('failed to build chunk: '+this.position.toString());
            console.error(e);
        }
    },
    dispose: function(){
        if(this.mesh) this.mesh.geometry.dispose();
        if(this.collisionMesh) this.collisionMesh.geometry.dispose();

        this.map.group.remove(this.group);
        this.map.debugGroup.remove(this.debugGroup);
        this.map.collisionGroup.remove(this.collisionGroup);

        //remove all my blocks
        for (var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i]) this.blocks[i].dispose();
        };
        delete this.blocks;
        delete this;
    },
    getNeighbor: function(v){
        if(_.isArray(v)) v = new THREE.Vector3().fromArray(v);
        v.sign();
        v.add(this.position);

        var id = v.toString();
        if(this.map.chunks[id]){
            return this.map.chunks[id];
        }
    },

    save: function(cb){
        this.map.saveChunk(this.position,cb);
    },
    remove: function(cb){
        this.map.removeChunk(this.position,cb);
    },
    unload: function(cb){
        this.map.unloadChunk(this.position,cb);
    }
}
Chunk.prototype.constructor = Chunk;
Object.defineProperties(Chunk.prototype,{
    worldPosition: {
        get: function(){
            return this.position.clone().multiplyScalar(game.chunkSize);
        }
    },
    scenePosition: {
        get: function(){
            return this.position.clone().multiplyScalar(game.chunkSize).multiplyScalar(game.blockSize);
        }
    },
    empty: {
        get: function(){
            var empty = true;
            var standared = this.blocks[0];
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];

                if(block instanceof Block !== standared instanceof Block){
                    empty = false;
                }
                if(block instanceof Block && standared instanceof Block){
                    if(block.material !== standared.material || block.shape !== standared.shape){
                        empty = false;
                    }
                }
            };
            return empty;
        }
    }
})