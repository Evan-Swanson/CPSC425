//Evan Swanson, Homework 3, 10/11/2018, eswanson2

"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let tz;
let tx=0;
let ty=0;
let mousePointX = 0;
let mousePointY = 0;
let previoustx = 0;
let previousty = 0;


let shapes = [];
let points = [];
let colors = [];


let status;

function xc(u,v)
{
    return Math.cos(v*Math.PI) * Math.sin(u*Math.PI);
}

function yc(u,v)
{
    return  Math.cos(u*Math.PI) *  Math.cos(v*Math.PI);
}

function zc(u,v)
{
    return Math.sin(v* Math.PI);
}


// Represents a shape to be drawn to the screen, and maintains the relevant
// GPU buffers
class Shape {
    constructor() {
        if (!gl) {
            console.log("Shape constructor must be called after WebGL is initialized");
        }
        // Buffer for vertex positions
        this.vBuffer = gl.createBuffer();

        // Buffer for vertex colors
        this.cBuffer = gl.createBuffer();

        // Transformation matrix
        this.mat = mat4();

        // Number of vertices in this shape
        this.numVertices = 0;

        // What draw mode to use
        this.drawMode = gl.TRIANGLES;

    }

    // Render the shape to the screen
    draw() {
        //TODO
        //console.log(this.numVertices);
        let location = gl.getUniformLocation(program, "mat");
        gl.uniformMatrix4fv(location, false, flatten(this.mat));
        //console.log(this.numVertices);
        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        let vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        let vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        //gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.drawArrays(this.drawMode, 0, this.numVertices);
    }

    // Set the positions and colors to be used for this shape.  Both positions
    // and colors should be arrays of vec4s.
    setData(positions, color) {
        if (positions.length != color.length) {
            console.log("Positions and colors not the same length");
        }
        // TODO
        this.numVertices = positions.length;

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    }

    // Set transformation matrix
    setMat(mat) {
        this.mat = mat;
    }
}

window.onload = function init()
{

    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    tz = document.getElementById("tz");
    [rot1, rot2, rot3, scale1, tz].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("input", render);
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
            render();
        });
    });

    // TODO: probably set up buttons here
    let addCube = document.getElementById("addCube");
    addCube.addEventListener("click" , function() {
        let cube = new Shape();
        colorCube();
        cube.setData(points, colors);
        shapes.push(cube);
        
        while (points.length > 0)
            points.pop();
        while (colors.length > 0)
            colors.pop();

        render();
    });

    let addPyramid = document.getElementById("addShapeTwo")
    addPyramid.addEventListener("click" , function(){
        let pyramid = new Shape();
        pyramidColor();
        pyramid.setData(points, colors);
        shapes.push(pyramid);

        while (points.length > 0)
            points.pop();
        while (colors.length > 0)
            colors.pop();

        render();

    });

    let addShape1 = document.getElementById("addShapeOne")
    addShape1.addEventListener("click" , function(){
        let hemi = new Shape();
        makeHemisphere();
        hemi.setData(points, colors);
        shapes.push(hemi);

        //console.log(points);
        //shapes[shapes.length - 1].setData(points, colors);
        while (points.length > 0)
            points.pop();
        while (colors.length > 0)
            colors.pop();

        render();
    });

    let addTetra = document.getElementById("addTet");
    addTetra.addEventListener("click" , function() {
        let tetra = new Shape();
        colorTetra();
        tetra.setData(points, colors);
        shapes.push(tetra);
        
        while (points.length > 0)
            points.pop();
        while (colors.length > 0)
            colors.pop();

        render();
    });


    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", function(event) {
        // TODO
        mousePointX = (2 * event.clientX / canvas.width - 1);
        mousePointY = (1 - 2 * event.clientY / canvas.height);

    });
    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons & 1 === 1) {
            tx = (2 * event.clientX / canvas.width - 1) - mousePointX + previoustx;
            ty = (1 - 2 * event.clientY / canvas.height) - mousePointY + previousty;
            // TODO
            render();
        }
    });

    canvas.addEventListener("mouseup", function(event) {
        // TODO
        previoustx = tx;
        previousty = ty;

    });

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );



    render();
};

function render()
{
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+tz.value).toFixed(2);
    
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let t1 = translate(tx, ty, tz.value);
    
    // TODO: set mat correctly
    let mat = mult(t1, mult(s1, mult(r3, mult(r2, r1))));
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let i=0; i<shapes.length; i++) {
        if (i === shapes.length - 1) {
            shapes[i].setMat(mat);
        }
        shapes[i].draw();
    }
}

function colorTetra()
{
    tetra(0,1,2,1);
    tetra(0,2,3,2);
    tetra(1,2,3,4);
    tetra(0,1,3,5);
}

function tetra(a,b,c,d)
{
    let vertices = [
        vec4( -0.5,  0.0,  0.0, 1.0 ),
        vec4(  0.5,  0.0,  0.0, 1.0 ),
        vec4(  0.0,  0.0,  1.0, 1.0 ),
        vec4(  0.0,  1.0,  0.3333, 1.0 )
    ];

    let vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 )   // white
    ];

    var indices = [ a, b, c];
    for ( let i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[d]);
    }
}

function pyramidColor()
{
    pyramid(0,1,2,1);
    pyramid(0,2,3,1);
    pyramid(4,0,1,2);
    pyramid(4,1,2,3);
    pyramid(4,2,3,5);
    pyramid(4,3,0,4);
}

function pyramid(a,b,c,d)
{
    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4(  0.0,  0.0, -0.5, 1.0 ),
    ];

    let vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 )   // white
    ];

    var indices = [ a, b, c];
    for ( let i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[d]);
    }
}


//got from book example
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    let vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 )   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
    
}

function makeHemisphere()
{
    const NUM_STEP = 20;
    for(let u = 0; u < NUM_STEP; u++)
    {
        for (let v = 0; v < NUM_STEP; v++)
        {
            let uf = u/NUM_STEP;
            let vf = v/NUM_STEP;
            let upf = (u + 1) / NUM_STEP;
            let vpf = (v + 1) / NUM_STEP;
            let currentColor = vec4(1,0,0,1);
            if((u + v) % 2 === 0)
            {
                currentColor = vec4(0,0,1,1);
            }

            points.push(vec4(xc(uf,vf), yc(uf,vf), zc(uf,vf)));
            points.push(vec4(xc(upf,vf), yc(upf,vf), zc(upf,vf)));
            points.push(vec4(xc(upf,vpf), yc(upf,vpf), zc(upf,vpf)));

            points.push(vec4(xc(upf,vpf), yc(upf,vpf), zc(upf,vpf)));
            points.push(vec4(xc(uf,vpf), yc(uf,vpf), zc(uf,vpf)));
            points.push(vec4(xc(uf,vf), yc(uf,vf), zc(uf,vf)));

            for(let i = 0; i<6; i++)
            {
                colors.push(currentColor);
            }
        }
    }
}