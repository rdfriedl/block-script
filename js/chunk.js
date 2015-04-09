Chunk = function(position,map){
    this.blocks = [];
    this.position = position;
    this.map = map;
}
Chunk.prototype = {
    blocks: [],
    position: new THREE.Vector3(),
    loading: false,
    mesh: undefined,
    map: undefined,
    worker: undefined,
    setBlock: function(position,data){
        //data is the export of a block or an id from the genorator
        if(_.isNumber(data)) data = {id: data};
        if(_.isString(data)) data = {id: blocks.nameToID(data)};

        var block = blocks.createBlockFromID(data.id,position,data,this);
        if(block){
            this.blocks[positionToIndex(position,map.chunkSize)] = block;
        }
    },
    inportData: function(data){ //data is a array of blocks
        // this.blocks = data;
        data = data || [];

        for (var i = 0; i < data.length; i++) {
            this.setBlock(indexToPosition(i,map.chunkSize),data[i]);
        };
        try{
            this.build();
        }
        catch(err){
            console.log(err)
        }
    },
    exportData: function(){
        //going to have to loop through block array and export each one
        var data = [];
        for (var i = 0; i < this.blocks.length; i++) {
            data.push(this.blocks[i].exportData());
        };
        return data;
    },
    build: function(cb){
        if(this.mesh){
            this.map.group.remove(this.mesh);
        }

        var meshed = CulledMesh(this.blocks);
        var geometry = new THREE.Geometry();

        geometry.faces.length = 0
        
        geometry.vertices = meshed.vertices;
        
        for (var i in meshed.faces) {
            var q = meshed.faces[i]

            //repeate two times since we use two face3(s) to replace face4
            var f = new THREE.Face3(q[0], q[1], q[2], new THREE.Vector3(), new THREE.Color(), q[4])
            geometry.faceVertexUvs[0].push(faceVertexUv(meshed,i))
            geometry.faces.push(f)

            var f = new THREE.Face3(q[0], q[2], q[3], new THREE.Vector3(), new THREE.Color(), q[4])
            geometry.faceVertexUvs[0].push(faceVertexUv2(meshed,i))
            geometry.faces.push(f)
        }
        
        geometry.computeFaceNormals()
        
        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()

        this.mesh = new THREE.Mesh(geometry, blocks.blockMaterial)

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.position.copy(this.position);
        this.mesh.position.multiplyScalar(map.chunkSize).multiplyScalar(map.blockSize);
        this.mesh.scale.set(map.blockSize,map.blockSize,map.blockSize);

        this.map.group.add(this.mesh);

        if(cb) cb();
    },
    save: function(cb){
        this.map.saveChunk(this.position,cb);
    },
    remove: function(cb){
        this.map.removeChunk(this.position,cb);
    },
    _remove: function(){
        this.map.group.remove(this.mesh);
    },
    getNeighbor: function(dir){
        var x = this.position.x,
            y = this.position.y,
            z = this.position.z;
        switch(dir){
            case 'x':
                x+=1;
                break;
            case '-x':
                x-=1;
                break;
            case 'y':
                y+=1;
                break;
            case '-y':
                y-=1;
                break;
            case 'z':
                z+=1;
                break;
            case '-z':
                z-=1;
                break;
        }
        var id = x+'|'+y+'|'+z;
        if(this.map.chunks[id]){
            return this.map.chunks[id];
        }
    }
}
Chunk.prototype.constructor = Chunk;
Object.defineProperties(Chunk.prototype,{
    chunkUp: {
        get: function(){ return this.getNeighbor('y') },
    },
    chunkDown: {
        get: function(){ return this.getNeighbor('-y') },
    },
    chunkRight: {
        get: function(){ return this.getNeighbor('x') },
    },
    chunkLeft: {
        get: function(){ return this.getNeighbor('-x') },
    },
    chunkFoward: {
        get: function(){ return this.getNeighbor('z') },
    },
    chunkBack: {
        get: function(){ return this.getNeighbor('-z') },
    },
})

function faceVertexUv(meshed,i) {
    var vs = [
        meshed.vertices[meshed.faces[i][0]],
        meshed.vertices[meshed.faces[i][1]],
        meshed.vertices[meshed.faces[i][2]],
        meshed.vertices[meshed.faces[i][3]]
    ]
    var spans = {
        x0: vs[0].x - vs[1].x,
        x1: vs[1].x - vs[2].x,
        y0: vs[0].y - vs[1].y,
        y1: vs[1].y - vs[2].y,
        z0: vs[0].z - vs[1].z,
        z1: vs[1].z - vs[2].z
    }
    var size = {
        x: Math.max(Math.abs(spans.x0), Math.abs(spans.x1)),
        y: Math.max(Math.abs(spans.y0), Math.abs(spans.y1)),
        z: Math.max(Math.abs(spans.z0), Math.abs(spans.z1))
    }
    if (size.x === 0) {
        if (spans.y0 > spans.y1) {
            var width = size.y
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.y
        }
    }
    if (size.y === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.x
        }
    }
    if (size.z === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.y
        }
        else {
            var width = size.y
            var height = size.x
        }
    }
    if ((size.z === 0 && spans.x0 < spans.x1) || (size.x === 0 && spans.y0 > spans.y1)) {
        return [
            new THREE.Vector2(height, 0),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, width),
            // new THREE.Vector2(height, width)
        ]
    } 
    else {
        return [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, height),
            new THREE.Vector2(width, height),
            // new THREE.Vector2(width, 0)
        ]
    }
};

function faceVertexUv2(meshed,i) {
    var vs = [
        meshed.vertices[meshed.faces[i][0]],
        meshed.vertices[meshed.faces[i][1]],
        meshed.vertices[meshed.faces[i][2]],
        meshed.vertices[meshed.faces[i][3]]
    ]
    var spans = {
        x0: vs[0].x - vs[1].x,
        x1: vs[1].x - vs[2].x,
        y0: vs[0].y - vs[1].y,
        y1: vs[1].y - vs[2].y,
        z0: vs[0].z - vs[1].z,
        z1: vs[1].z - vs[2].z
    }
    var size = {
        x: Math.max(Math.abs(spans.x0), Math.abs(spans.x1)),
        y: Math.max(Math.abs(spans.y0), Math.abs(spans.y1)),
        z: Math.max(Math.abs(spans.z0), Math.abs(spans.z1))
    }
    if (size.x === 0) {
        if (spans.y0 > spans.y1) {
            var width = size.y
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.y
        }
    }
    if (size.y === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.x
        }
    }
    if (size.z === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.y
        }
        else {
            var width = size.y
            var height = size.x
        }
    }
    if ((size.z === 0 && spans.x0 < spans.x1) || (size.x === 0 && spans.y0 > spans.y1)) {
        return [
            new THREE.Vector2(height, 0),
            // new THREE.Vector2(0, 0),
            new THREE.Vector2(0, width),
            new THREE.Vector2(height, width)
        ]
    } 
    else {
        return [
            new THREE.Vector2(0, 0),
            // new THREE.Vector2(0, height),
            new THREE.Vector2(width, height),
            new THREE.Vector2(width, 0)
        ]
    }
};

//code from https://github.com/maxogden/voxel/blob/master/meshers/culled.js
function CulledMesh(blocks) {
    //Precalculate direction vectors for convenience
    var facePositions = new Array(3);
    for(var i=0; i<3; ++i) {
        facePositions[i] = [new THREE.Vector3(), new THREE.Vector3()];
        facePositions[i][0][ ['x','y','z'][(i+1)%3] ] = 1;
        facePositions[i][1][ ['x','y','z'][(i+2)%3] ] = 1;
    }

    //March over the blocks
    var vertices = [];
    var verticeCache = {};
    var faces = [];
    for(var index = 0; index < map.chunkSize*map.chunkSize*map.chunkSize; index++){
        var block = blocks[index];

        //if its not a block skip it
        if(!(block instanceof Block)) continue;

        var otherBlocks = [
            [block.getNeighbor('x'),0],
            [block.getNeighbor('y'),1],
            [block.getNeighbor('z'),2],
        ];
        //if we are at the edge then check all 6 blocks
        if(block.position.x == 0) otherBlocks.push([block.getNeighbor('-x'),0]);
        if(block.position.y == 0) otherBlocks.push([block.getNeighbor('-y'),1]);
        if(block.position.z == 0) otherBlocks.push([block.getNeighbor('-z'),2]);

        //Generate faces
        for(var d=0; d<otherBlocks.length; ++d){
            var otherBlock = otherBlocks[d][0];
            var faceSide = otherBlocks[d][1];

            if(!(block instanceof Block && otherBlock instanceof Block)) continue;

            if((block instanceof SolidBlock) !== (otherBlock instanceof SolidBlock)) {
                var side = (block instanceof SolidBlock)? 0 : 1;
                var mat = (block instanceof SolidBlock)? 0 : 1;
                if(d >= 3) side = (side)? 0 : 1; //flip the face around if we are checking more then 3 blocks
                var pos = block.position.clone();
                var u = facePositions[faceSide][side];
                var v = facePositions[faceSide][side^1];
                if(d < 3) ++pos[['x','y','z'][faceSide]];

                var v1ID = (pos.x        )+'|'+(pos.y        )+'|'+(pos.z        );
                var v2ID = (pos.x+u.x    )+'|'+(pos.y+u.y    )+'|'+(pos.z+u.z    );
                var v3ID = (pos.x+u.x+v.x)+'|'+(pos.y+u.y+v.y)+'|'+(pos.z+u.z+v.z);
                var v4ID = (pos.x    +v.x)+'|'+(pos.y    +v.y)+'|'+(pos.z    +v.z);
                var v1 = (verticeCache[v1ID] !== undefined)? verticeCache[v1ID] : verticeCache[v1ID] = vertices.push( new THREE.Vector3( pos.x        , pos.y        , pos.z         ) ) -1;
                var v2 = (verticeCache[v2ID] !== undefined)? verticeCache[v2ID] : verticeCache[v2ID] = vertices.push( new THREE.Vector3( pos.x+u.x    , pos.y+u.y    , pos.z+u.z     ) ) -1;
                var v3 = (verticeCache[v3ID] !== undefined)? verticeCache[v3ID] : verticeCache[v3ID] = vertices.push( new THREE.Vector3( pos.x+u.x+v.x, pos.y+u.y+v.y, pos.z+u.z+v.z ) ) -1;
                var v4 = (verticeCache[v4ID] !== undefined)? verticeCache[v4ID] : verticeCache[v4ID] = vertices.push( new THREE.Vector3( pos.x    +v.x, pos.y    +v.y, pos.z    +v.z ) ) -1;
                faces.push([v1, v2, v3, v4, mat ? otherBlock.material[faceSide][side] : block.material[faceSide][side]]);
            }
        }
    }
    return { vertices:vertices, faces:faces };
}