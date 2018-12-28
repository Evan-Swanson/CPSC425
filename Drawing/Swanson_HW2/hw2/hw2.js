"use strict";

/** @type{WebGLRenderingContext} */
let gl;
let program;

let drawingLines = true;
let isDrawing = false;
// You will want to add additional variables to keep track of what needs
// to be drawn

let point;
let points = [];

let colors = [];
let currentColor;
let numberOfVerts = [];
let start = [];
start.push(0);
let numberOfLines = 0;

let shapeType = [];

let vertCount = 0;

window.addEventListener("load", function()
{
    //Color Buttons
    let redButton = document.getElementById("colorRed");
    redButton.addEventListener("click", function() {
        currentColor = vec3(1,0,0); 
    });

    let blueButton = document.getElementById("colorBlue");
    blueButton.addEventListener("click", function() {
        currentColor = vec3(0,0,1); 
    });

    let greenButton = document.getElementById("colorGreen");
    greenButton.addEventListener("click", function() {
        currentColor = vec3(0,1,0); 
    });

    let blackButton = document.getElementById("colorBlack");
    blackButton.addEventListener("click", function() {
        currentColor = vec3(0,0,0);
    });

    //Type Buttons
    let linesButton = document.getElementById("shapeLine");
    linesButton.addEventListener("click", function() {
        drawingLines = true; 
    });

    let fillButton = document.getElementById("shapeFilled");
    fillButton.addEventListener("click", function() {
        drawingLines = false; 
    });


    point = vec2(0,0);
    currentColor = vec3(0,0,0);
    points = [ point ];
    points.pop();
    colors = [ currentColor ];
    colors.pop();
    
    let canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0 ,0)
    gl.enableVertexAttribArray(vColor);




    canvas.addEventListener("mousedown", function(event) {
        isDrawing = true;
        numberOfLines++;
        numberOfVerts.push(0);
        if(drawingLines)
            shapeType.push(1);
        else
            shapeType.push(2);
    });
    
    canvas.addEventListener("mousemove", function(event) {
        if(isDrawing)
        {
            let status = document.getElementById("status");
            status.innerHTML = event.clientX + ", " + event.clientY;
            let normalizedX = 2 * event.clientX / canvas.width - 1;
            let normalizedY = 1 - 2 * event.clientY / canvas.height;
            point = vec2(normalizedX, normalizedY);
            points.push(point);
            colors.push(currentColor);
            vertCount++;
            numberOfVerts[numberOfLines - 1] = vertCount;

            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
            gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);

            render();
        }

    });
    canvas.addEventListener("mouseup", function() {
        isDrawing = false;
        start.push(start[numberOfLines - 1] + vertCount);
        vertCount = 0;
        


        //console.log(points);
    });

    gl.clear( gl.COLOR_BUFFER_BIT );
});


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var i = 0; i < numberOfLines; i++)
    {
        if(shapeType[i] === 1)
            gl.drawArrays( gl.LINE_STRIP, start[i] , numberOfVerts[i]);
        else    
            gl.drawArrays( gl.TRIANGLE_FAN, start[i] , numberOfVerts[i]);
    }
}
