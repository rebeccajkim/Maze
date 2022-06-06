"use strict";

var gl;
var positions = [];

var N = 5;
var M = 5;

var dir = null;
var pos = [-1,1];

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    createGrid(N,M);
    //maze();
    pos=rat(dir,pos);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPUg
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();

    document.getElementById("slider").onchange = function(event) {
        N = document.getElementById('slider').value;
        var val=document.getElementById('demo');
        createGrid(N,M);
        render();
        val.innerHTML=N;
    };
    document.getElementById("slider2").onchange = function(event) {
        M = document.getElementById('slider2').value;
        var val2=document.getElementById('demo2');
        createGrid(N,M);
        render();
        val2.innerHTML=M;
    };
    window.onkeydown = function(event) {
        switch( event.keyCode ) {
          case 37:
            dir = "left";
            pos=rat(dir,pos);
            break;

          case 38:
            dir = "up";
            pos=rat(dir,pos);
            break;

          case 39:
            dir = "right";
            pos=rat(dir,pos);
            break;
         
          case 40:
            dir = "down";
            pos=rat(dir,pos);
            break;
        }
        
        //  Load shaders and initialize attribute buffers

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Load the data into the GPU

        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

        // Associate out shader variables with our data buffer

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        gl.drawArrays(gl.LINES, 0, positions.length);
    };
};

function createGrid(N,M) {
    positions=[];
    for (var i=0; i<M; i++) {
        for (var j=0; j<N; j++) {
            var row1 = (1-(-1))*(i/M)+(-1);
            var col1 = (1-(-1))*(j/N)+(-1);
            var row2 = (1-(-1))*((i+1)/M)+(-1);
            var col2 = (1-(-1))*(j/N)+(-1);
            var row3 = (1-(-1))*((i+1)/M)+(-1);
            var col3 = (1-(-1))*((j+1)/N)+(-1);
            var row4 = (1-(-1))*(i/M)+(-1);
            var col4 = (1-(-1))*((j+1)/N)+(-1);
            if (i==0 && j==0) {
                positions.push(vec2(row1,col1),vec2(row2,col2),
                            vec2(row2,col2),vec2(row3,col3),
                            vec2(row3,col3),vec2(row4,col4),
                            vec2(row4,col4),vec2(row1,col1));
            }
            else if (i==0) {
                positions.push(vec2(row1,col1),vec2(row2,col2),
                            vec2(row2,col2),vec2(row3,col3),
                            vec2(row3,col3),vec2(row4,col4));
            } 
            else if (j==0) {
                positions.push(vec2(row1,col1),vec2(row2,col2),
                            vec2(row2,col2),vec2(row3,col3),
                            vec2(row4,col4),vec2(row1,col1));
            } 
            else {
                positions.push(vec2(row1,col1),vec2(row2,col2),
                            vec2(row2,col2),vec2(row3,col3));
            } 
        }
    }
    for (var k=0; k<(N*M); k++) {
        var rand = Math.floor(Math.random()*positions.length);
        //if (rand==4 || rand%6==0 && rand>0 && rand<=6*M || rand==6*M-2 || rand==36 || rand==52) {
            //break;
        //}
        if (rand%2==0) {
            positions.splice(rand,2);
        }
        else {
            positions.splice(rand+1,2);
        }
    }  
    positions.push(vec2(pos[0]+(1-(-1))*(1/(3*M)),pos[1]+(1-(-1))*(1/(3*N))),vec2(pos[0]+(1-(-1))*(2/(3*M)),pos[1]+(1-(-1))*(1/(3*N))),
                vec2(pos[0]+(1-(-1))*(2/(3*M)),pos[1]+(1-(-1))*(1/(3*N))),vec2(pos[0]+(1-(-1))*(2/(3*M)),pos[1]+(1-(-1))*(2/(3*N))),
                vec2(pos[0]+(1-(-1))*(2/(3*M)),pos[1]+(1-(-1))*(2/(3*N))),vec2(pos[0]+(1-(-1))*(1/(3*M)),pos[1]+(1-(-1))*(2/(3*N))),
                vec2(pos[0]+(1-(-1))*(1/(3*M)),pos[1]+(1-(-1))*(2/(3*N))),vec2(pos[0]+(1-(-1))*(1/(3*M)),pos[1]+(1-(-1))*(1/(3*N))));
}

//dfs
/*
function maze() {
    positions=[];
    var totalCells = N*M;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < M; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < N; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
        }
    }
    var currentRow = Math.floor(Math.random()*N);
    var currentCol = Math.floor(Math.random()*M);
    var path = [currentRow,currentCol];
    var temp=unvis[currentRow];
    temp[currentCol] = false;
    var visited = 1;
    while (visited < totalCells) {
        var pot = [[currentRow-1, currentCol, 0, 2],
                [currentRow, currentCol+1, 1, 3],
                [currentRow+1, currentCol, 2, 0],
                [currentRow, currentCol-1, 3, 1]];
        var neighbors = new Array();
        for (var l = 0; l < 4; l++) {
            var temp2 = pot[l][0];
            var temp3 = pot[l][1];
            if (pot[l][0] > -1 && pot[l][0] < N && pot[l][1] > -1 && pot[l][1] < M && unvis[temp2][temp3]==true) { 
                neighbors.push(pot[l]); 
            }
        }
        if (neighbors.length) {
            var next = neighbors[Math.floor(Math.random()*neighbors.length)];
            cells[currentRow][currentCol][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;
            unvis[next[0]][next[1]] = false;
            visited++;
            currentRow = next[0];
            currentCol = next[1];
            path.push([currentRow,currentCol]);
        }
        else {
            currentCell = path.pop();
        }
    }
    for (var m=0; m<M; m++) {
        for (var n=0; n<N; n++) {
            var row1 = (1-(-1))*(i/M)+(-1);
            var col1 = (1-(-1))*(j/N)+(-1);
            var row2 = (1-(-1))*((i+1)/M)+(-1);
            var col2 = (1-(-1))*(j/N)+(-1);
            var row3 = (1-(-1))*((i+1)/M)+(-1);
            var col3 = (1-(-1))*((j+1)/N)+(-1);
            var row4 = (1-(-1))*(i/M)+(-1);
            var col4 = (1-(-1))*((j+1)/N)+(-1);
            if (cells[m][n][0]==0) {
                positions.push(vec2(row1,col1),vec2(row2,col2));
            }
            if (cells[m][n][1]==0) {
                positions.push(vec2(row2,col2),vec2(row3,col3));
            }
            if (cells[m][n][2]==0) {
                positions.push(vec2(row3,col3),vec2(row4,col4));
            }
            if (cells[m][n][3]==0) {
                positions.push(vec2(row4,col4),vec2(row1,col1));
            }
        } 
    }
}
*/

function rat(dir,posi) {
    positions.pop(); positions.pop();
    positions.pop(); positions.pop();
    positions.pop(); positions.pop();
    positions.pop(); positions.pop();
    if (dir=="left") {
        if (!(positions.includes(vec2(posi[0],posi[1]+((1-(-1))*(1/N))),positions.indexOf(vec2(posi[0],posi[1]))-1))) {
            posi = [posi[0]-((1-(-1))*(1/M)),posi[1]];
        }
    }
    else if (dir=="up") {
        if (!(positions.includes(vec2(posi[0],posi[1]),positions.indexOf(vec2(posi[0]+((1-(-1))*(1/M)),posi[1]))-1))) {
            posi = [posi[0], posi[1]+((1-(-1))*(1/N))];
        }
    }
    else if (dir=="right") {
        if (!(positions.includes(vec2(posi[0]+((1-(-1))*(1/M)),posi[1]),positions.indexOf(vec2(posi[0]+((1-(-1))*(1/M)),posi[1]+((1-(-1))*(1/N))))-1))) {
            posi = [posi[0]+((1-(-1))*(1/M)),posi[1]];
        }
    }
    else {
        if (!(positions.includes(vec2(posi[0]+((1-(-1))*(1/M)),posi[1]+((1-(-1))*(1/N))),positions.indexOf(vec2(posi[0],posi[1]+((1-(-1))*(1/N))))-1))) {
            posi = [posi[0],posi[1]-((1-(-1))*(1/N))];
        }
    }
    positions.push(vec2(posi[0]+(1-(-1))*(1/(3*M)),posi[1]+(1-(-1))*(1/(3*N))),vec2(posi[0]+(1-(-1))*(2/(3*M)),posi[1]+(1-(-1))*(1/(3*N))),
                vec2(posi[0]+(1-(-1))*(2/(3*M)),posi[1]+(1-(-1))*(1/(3*N))),vec2(posi[0]+(1-(-1))*(2/(3*M)),posi[1]+(1-(-1))*(2/(3*N))),
                vec2(posi[0]+(1-(-1))*(2/(3*M)),posi[1]+(1-(-1))*(2/(3*N))),vec2(posi[0]+(1-(-1))*(1/(3*M)),posi[1]+(1-(-1))*(2/(3*N))),
                vec2(posi[0]+(1-(-1))*(1/(3*M)),posi[1]+(1-(-1))*(2/(3*N))),vec2(posi[0]+(1-(-1))*(1/(3*M)),posi[1]+(1-(-1))*(1/(3*N))));
    return posi;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.drawArrays(gl.LINES, 0, positions.length);
}