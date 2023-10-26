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
var x, y, z, dx, dy, dz, vx, vy, vz, px, py, pz;

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
	colors = colors.concat([vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0)])
	colors = colors.concat([vec3(0.1,0.3,0), vec3(0.1,0.3,0), vec3(0.1,0.3,0)])
	colors = colors.concat([vec3(0,1,0.8), vec3(0,1,0.8), vec3(0,1,0.8)])
	colors = colors.concat([vec3(1,1,0), vec3(1,1,0), vec3(1,1,0)])
	colors = colors.concat([vec3(0.3,0.5,0.1), vec3(0.3,0.5,0.1), vec3(0.3,0.5,0.1)])
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

    tetrahedron(va, vb, vc, vd, 2);
    x = 0; y = 0; z = 0;
    dx = 1.6 * Math.random() - 0.8;
    dz = 1.6 * Math.random() - 0.8;
    dy = 1.6 * Math.random() - 0.8;

    vx = 0.06 * Math.random() - 0.03;
    vy = 0.06 * Math.random() - 0.03;
    vz = 0.06 * Math.random() - 0.03;

	px = 0; py = 0; pz = 0;



	
	pyramid()

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



function angle(v1, v2) {
	let dot_product = dot(v2, v1)
	let mag_v1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2)
	let mag_v2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2)
	let angle = Math.acos(dot_product/ (mag_v2 * mag_v1))
	return angle * (180 / Math.PI)

}

var axis = 0
var tip_pointing = vec4(0,1,0,0)
function render() {
	axis += 2

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var ctm = mat4()
	dx += vx
	dy += vy
	dz += vz
	ctm = mult(ctm, translate(dx,dy,dz))

	if (dy >= 0.8 || dy <= -0.8) {
		vy *= -1
	}
	if (dz >= 0.8 || dz <= -0.8) {
		vz *= -1
	}
	if (dx >= 0.8 || dx <= -0.8) {
		vx *= -1
	}

	ctm = mult(ctm, scale(0.2,0.2,0.2))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    for( var i=0; i<index; i+=3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

	ctm = mat4()

	// Find the vectors that points from the tip of the triangle to the center of the sphere
	// find the dot product of that vector and 0,1,0,0 vector for the angle
	// Find the cross product between the two and roatae on that axis
	
	var tip_pointing_point = vec4(px,py,pz,1)
	var v3 =  subtract(vec4(dx,dy,dz,1), tip_pointing_point, )
	let ange = angle(vec4(0,1,0,0), v3) 
	// ctm = mult(ctm, rotate(ange, cross(tip_pointing, v3)))
	// ange = 450 
    ctm = mult(ctm, translate(px += v3[0]/80,py += v3[1]/80,pz += v3[2]/80))
	ctm = mult(ctm, rotate(ange, cross(v3,vec4(0,1,0,0))))
//	tip_pointing = mult(rotate(ange, cross(v3, tip_pointing)), tip_pointing)

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));

	gl.drawArrays(gl.TRIANGLE_FAN, index, 4)
	gl.drawArrays(gl.TRIANGLE_FAN, index +4,3 )
	gl.drawArrays(gl.TRIANGLE_FAN, index +7,3 )
	gl.drawArrays(gl.TRIANGLE_FAN, index +10,3 )
	gl.drawArrays(gl.TRIANGLE_FAN, index +13,3 )

	requestAnimationFrame(render);

}

