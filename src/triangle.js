// Malcolm Kahora CSC 350
"use strict";

// Remove the cur_x and cur_y translations
// Make a angle var that increas wheneve right or left is pressed
// Only translate on up arrow
// Done

var gl;
var points;
var border = 1 / 12
var line_size = 1

const Direction = {
    RIGHT: 0,
    LEFT: 1,
    UP: 2
}

var direction = Direction.UP

var row = 2
var col = 11

var interpolate = function (x, x0, x1, y0, y1) {
    return y0 + (x - x0) * ((y1 - y0) / (x1 - x0))
}

var finished = false
// Start at the begining
var cur_y = interpolate(row, 0, 11, (1 - border), (-1 + border))
var cur_x = interpolate(col, 0, 11, (-1 + border), (1 - border))

var circle_length = 0;
var circle_filled_length = 0;
var rect_length = 4;
var many_circles_size = 0
var modelViewMatrixLoc;

var length_points = 0

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    var hex2bin = function(hex) {
	return parseInt(hex, 16).toString(2).padStart(4, 0)
    }

    var circle_calc = function (x,y,step,radius, color, color_list) {
	var returnList = []
	for (let i = 0; i <= 6.28; i+=step) {
	    returnList.push(vec2(radius * Math.cos(i) + x, radius * Math.sin(i) + y))
	    color_list.push(color)
	}
	return returnList
    }


    // Movement should be broken down as so
    // read the binary restrict movement only go in a 0 direction

    var path = []
    var index = 0

    //  place a point to finish the path
    var place_point = function(x,y) {
	points.push(vec2(x,y))
	colors.push(vec3(0,0,0))

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	line_size += 1

	render()
    }

    window.onkeydown = function (event) {
	var current_spot = final_map[row][col]
	var clamp = (d, m, ma) => Math.max(m,Math.min(ma, d))
	
	    switch (event.key) {
	    case "ArrowRight":
		if (current_spot[2] != "1") {
		    col = clamp(col + 1, 0, 11)
		    var new_spot = final_map[row][col]
		    // Looks ahead to make sure there is no wall
		    if (new_spot[0] == "1") { // if the next spot does not conain a 1 they can progress
			col -= 1
		    }
		}
		direction = Direction.RIGHT
		break
	    case "ArrowLeft":
		if (current_spot[0] != "1") {
		    col = clamp(col - 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[2] == "1") { // if the next spot does not conain a 1 they can progress
			col += 1
		    }

		}
		direction = Direction.LEFT
		break
	    case "ArrowUp":
		if (current_spot[3] != "1") {
		    row = clamp(row - 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[1] == "1") { // if the next spot does not conain a 1 they can progress
			row += 1
		    }

		}
		direction = Direction.UP

		break
	    case "ArrowDown":
		if (current_spot[1] != "1") {
		    row = clamp(row + 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[3] == "1") { // if the next spot does not conain a 1 they can progress
			row -= 1 
		    }
		}
		break
	    }
	if (row == 5 && col == 11) {
	    finished = true
	}
	// clamp row and col within 0 and 12
	row = clamp(row, 0, 11)
	col = clamp(col, 0, 11)
	
	
	// turn row and cols into x and y
	border = 1/12
	cur_y = interpolate(row, 0, 11, (1 - border), (-1 + border))
	cur_x = interpolate(col, 0, 11, (-1 + border), (1 - border))
	place_point(cur_x, cur_y)

	// update the ctm

    }

    // Graph walls encode with hex

    var circle = []
    var color_hollow_circle = []
    var maze_graph_string = 
`911111111113
891541194312
95513A969C55
A92AAE816962
AAEAC52C1452
AC5457C3C955
C15535569A02
8C53AD116A22
855683855222
95556AA90A32
AD555682C562
C55555644446`


    var final_map = maze_graph_string.split("\n").map((element) => element.split("").map((x) => hex2bin(x)))

    //var maze_graph = [["8", "8", "8]]
    //color and point map that get sent to the shader
    var points = []
    var colors = []
    // converst the hex into binary stinrg

    var maze_graph = function(items) {
	var step = 1/6
	for (let j = 0; j < items.length; j++) {
	    for (let i = 0; i < items[0].length; i++) {
		var bin = items[j][i]
		var x_start = -1 + (i * step)
		var y_start = 1 - (j * step)
		var x_end = -1 + (i * step) + step
		var y_end = 1 - (j * step) - step
	    // up
		if (bin[3] == "1") {
		    points.push(vec2(x_start, y_start))	
		    points.push(vec2(x_end, y_start))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
	    // rigt
		if (bin[2] == "1") {
		    points.push(vec2(x_end, y_start))	
		    points.push(vec2(x_end, y_end))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
		// down
		if (bin[1] == "1") {
		    points.push(vec2(x_end, y_end))	
		    points.push(vec2(x_start, y_end))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
		// left
		if (bin[0] == "1") {
		    points.push(vec2(x_start, y_end))	
		    points.push(vec2(x_start, y_start))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
	    }
	}
    }

    // Puts the vec2 into the points list
    maze_graph(final_map)

    var border = 1 - 1/12
    var radius = 0.05
    var precision = 0.1

    var circle = circle_calc(0,0,precision,radius, vec3(0,0,1), color_hollow_circle)

    var face = [vec2(-0.1,0), vec2(0,0.1), vec2(0.1,0)]
    var face_color = [vec3(1,0,1), vec3(1,0.5,0), vec3(0.3,1,0.06)]

    circle_length = circle.length
    length_points = points.length
    colors = colors.concat(color_hollow_circle).concat(face_color)
    points = points.concat(circle).concat(face)
    // length as global var

    points.push(vec2(cur_x,cur_y))
    colors.push(vec3(0,0,0))

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );   
 
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        

    // Load the data into the GPU       
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");    
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);    

    // Load the data into the GPU       
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
   
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);    

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    render();
};

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT); 

    // The maze itself
    var ctm = mat4()
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.LINES, 0, length_points)


    // The circle
    ctm = finished ? mult(ctm, translate(0, 0, 0)) : mult(ctm, translate(cur_x, cur_y, 0))
    if (direction == Direction.RIGHT) {
	ctm = mult(ctm, rotateZ(-90))
    }
    if (direction == Direction.LEFT) {
	ctm = mult(ctm, rotateZ(90))
    }
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLE_FAN, length_points, circle_length)


    // The face
    gl.drawArrays(gl.TRIANGLE_FAN, circle_length + length_points, 3)



    // The path
    ctm = mat4()
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.LINE_STRIP, length_points + circle_length + 3, line_size )

    setTimeout(
       function (){requestAnimationFrame(render);}, 100
    );
    
}
