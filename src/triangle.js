// Malcolm Kahora CSC 350
"use strict";

var gl;
var points;
var border = 1 / 12

var row = 2
var col = 11
var interpolate = function (x, x0, x1, y0, y1) {
    return y0 + (x - x0) * ((y1 - y0) / (x1 - x0))
}

var finished = false
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
    //
    //
    function mapToRange(num, minOutput, maxOutput) {
	if (num < 0 || num > 12) {
	    throw new Error("Input number must be between 0 and 12");
	}

	// Map the input number to the range [-0.95, 0.95]
	const minInput = 0;
	const maxInput = 12;

	const scaledValue = (num - minInput) / (maxInput - minInput);
	const result = (scaledValue * (maxOutput - minOutput)) + minOutput;

	return result;
    }

    var path = []
    var index = 0
    var place_point = function(x,y) {
	path.push(vec2(x,y))
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(vec2(x,y)));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(vec4(0,1,1,1)));
        index++;
    }



    window.onkeydown = function (event) {
	var current_spot = final_map[row][col]
	var clamp = (d, m, ma) => Math.max(m,Math.min(ma, d))
	
	console.log(current_spot)
	    switch (event.key) {
	    case "ArrowRight":
		if (current_spot[2] != "1") {
		    col = clamp(col + 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[0] == "1") { // if the next spot does not conain a 1 they can progress
			col -= 1
		    }

			
		}

		break
	    case "ArrowLeft":
		if (current_spot[0] != "1") {
		    col = clamp(col - 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[2] == "1") { // if the next spot does not conain a 1 they can progress
			col += 1
		    }

		}
		break
	    case "ArrowUp":
		if (current_spot[3] != "1") {
		    row = clamp(row - 1, 0, 11)
		    var new_spot = final_map[row][col]
		    if (new_spot[1] == "1") { // if the next spot does not conain a 1 they can progress
			row += 1
		    }

		}
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
	console.log(row)
	
	
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
    var start = [mapToRange(0,-border, border),mapToRange(0,border, -border)]
    var radius = 0.05
    var precision = 0.1

    var circle = circle_calc(0,0,precision,radius, vec3(0,0,1), color_hollow_circle)
    circle_length = circle.length
    colors = colors.concat(color_hollow_circle)
    points = points.concat(circle)
    // length as global var
    length_points = points.length
    colors = colors.concat(color_hollow_circle)
    points = points.concat(circle)
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
    var ctm = mat4()
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.LINES, 0, length_points)


    ctm = finished ? mult(ctm, translate(0, 0, 0)) : mult(ctm, translate(cur_x, cur_y, 0))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));

    gl.drawArrays(gl.TRIANGLE_FAN, length_points, circle_length)

    setTimeout(
       function (){requestAnimationFrame(render);}, 100
    );
    
}
