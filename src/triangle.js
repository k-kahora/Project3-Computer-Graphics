// Malcolm Kahora
"use strict";

var gl;
var points;

var circle_length = 0;
var circle_filled_length = 0;
var rect_length = 4;
var many_circles_size = 0

var length_points = 0

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    var color_hollow_circle = []
    var color_filled_circle = []


    var hex2bin = function(hex) {
	return parseInt(hex, 16).toString(2).padStart(4, 0)
    }

    var maze_graph = [
["9","5","1","5","3","D","5","5","1","5","5","3"],
["A","B","A","B","C","3","9","5","6","9","7","A"],
["8","6","A","C","5","4","2","A","9","2","9","2"],
["6","9","2","9","3","D","6","8","6","C","6","B"],
["9","6","E","A","C","5","3","C","3","D","5","2"],
["8","5","5","4","5","7","C","3","C","5","3","A"],
["A","9","5","3","9","5","5","6","9","7","C","2"],
["A","A","B","A","A","D","1","1","6","9","5","6"],
["A","A","A","A","C","3","A","A","9","6","D","3"],
["A","C","2","C","3","A","E","A","A","D","1","0"],
["A","B","A","B","E","C","3","A","C","5","6","A"],
["C","6","C","4","5","5","6","C","5","5","5","6"]]

    //var maze_graph = [["8", "8", "8]]
    var points = []
    var colors = []
    const final_map = maze_graph.map((element) => element.map((item) => hex2bin(item)))
    console.log("Bin map")
    console.log(final_map)

    var maze_graph = function(items) {
	var step = 1/12
	for (let j = 0; j < items.length; j++) {
	    for (let i = 0; i < items[0].length; i++) {
		var bin = items[j][i]
		var x_start = -1 + (i * step)
		var y_start = 1 - (j * step)
		var x_end = -1 + (i * step) + step
		var y_end = 1 - (j * step) - step
	    // up
		if (bin[3] == "1") {
		    console.log("here")
		    points.push(vec2(x_start, y_start))	
		    points.push(vec2(x_end, y_start))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
	    // rigt
		if (bin[2] == "1") {
		    console.log("here")
		    points.push(vec2(x_end, y_start))	
		    points.push(vec2(x_end, y_end))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
		// down
		if (bin[1] == "1") {
		    console.log("here")
		    points.push(vec2(x_end, y_end))	
		    points.push(vec2(x_start, y_end))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
		// left
		if (bin[0] == "1") {
		    console.log("here")
		    points.push(vec2(x_start, y_end))	
		    points.push(vec2(x_start, y_start))	
		    colors.push(vec3(1,0.5,0.3))
		    colors.push(vec3(1,0.5,0.3))
		}
	    }
	}
    }

    maze_graph(final_map)
    console.log(points)
    console.log(colors)

    length_points = points.length


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

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT); 
    // gl.drawArrays(gl.LINE_LOOP, 0, 3)
    //
    gl.drawArrays(gl.LINES, 0, length_points)

    // their are 24 checkers

    // gl.drawArrays(gl.TRIANGLE_FAN, circle_length, circle_filled_length);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 126, 4);
}
