"use strict";

var canvas;
var gl;
var program;

// animations
var modelViewMatrixLoc;

var numTimesToSubdivide = 3;

var index = 0;

var vertices = [];
var colors = [];

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var ctm;
var x, y, z, dx, dy, dz;

function pyramid() {
	let bottom_left = vec4(-0.1,0,0.1,1)
	let bottom_right = vec4(0.1,0,0.1,1)
	let top_right = vec4(0.1,0,-0.1,1)
	let top_left = vec4(-0.1,0,-0.1,1)
	let tip = vec4(0,0.1,0,1)
	vertices = vertices.concat([bottom_left, bottom_right, top_right, top_left])
	vertices = vertices.concat([bottom_left, bottom_right, tip])
	vertices = vertices.concat([bottom_right, top_right, tip])
	vertices = vertices.concat([top_right, top_left, tip])
	vertices = vertices.concat([top_left, bottom_left, tip])
	colors = colors.concat([vec3(0,1,0), vec3(0,1,0), vec3(1,1,0), vec3(1,1,0)])
	colors = colors.concat([vec3(0.1,1,0), vec3(0,0.3,0), vec3(1,0,0)])
	colors = colors.concat([vec3(0,1,0.8), vec3(0,1,0.5), vec3(1,1,0.5)])
	colors = colors.concat([vec3(0,1,0.1), vec3(0.1,0,0), vec3(1,1,0)])
}

function triangle(a, b, c) {

     vertices.push(a);
     vertices.push(b);
     vertices.push(c);
     colors.push(vec3(0, 0, 0));colors.push(vec3(0, 0, 0));colors.push(vec3(0, 0, 0));

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    tetrahedron(va, vb, vc, vd, 3);
    x = 0; y = 0; z = 0;
    dx = 0.05*Math.random();
    dy = 0.05*Math.random();
    dz = 0.05*Math.random();
	
	console.log(vertices.length)
	pyramid()
	console.log(vertices.length)

    //triangle(va, vb, vc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Load the data into the GPU       
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");    
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);    
    
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    render();
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var ctm = mat4()
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    for( var i=0; i<index; i+=3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

	ctm = mult(ctm, rotateX(30))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));

	gl.drawArrays(gl.TRIANGLE_FAN, index, 4)
	gl.drawArrays(gl.TRIANGLE_FAN, index +4,3 )
	gl.drawArrays(gl.TRIANGLE_FAN, index +7,3 )
	gl.drawArrays(gl.TRIANGLE_FAN, index +10,3 )

}

