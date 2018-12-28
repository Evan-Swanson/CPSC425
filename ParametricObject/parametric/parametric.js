"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let points = [];
let colors = [];

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let t1;
let t2;

let status;

const NUM_DIVISIONS = 10;

// TODO: Maybe some global functions?

function xc(u,v)
{
    return v*Math.cos(u*2*Math.PI);
}

function yc(u,v)
{
    return v*Math.sin(u*2*Math.PI);
}

function zc(u,v)
{
    return v;
}

window.onload = function init()
{
    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    t1 = document.getElementById("t1");
    t2 = document.getElementById("t2");
    [rot1, rot2, rot3, scale1, t1, t2].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("input", render);
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
            render();
        });
    });
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    // enable hidden-surface removal

    gl.enable(gl.DEPTH_TEST);

    // TODO: In class code here
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

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader

    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    let vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};



function render()
{
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+t1.value).toFixed(2)
        + ", " + (+t2.value).toFixed(2);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let trans = translate(t1.value, t2.value, 0);

    let bigKahuna = mult(r1, r2);
    bigKahuna = mult(s1, bigKahuna);

    let location = gl.getUniformLocation(program, "mat");
    gl.uniformMatrix4fv(location, false, flatten(bigKahuna));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
