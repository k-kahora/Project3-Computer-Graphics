// Malcolm Kahora
"use strict";

var gl;
var points;

var circle_length = 0;
var circle_filled_length = 0;
var rect_length = 4;
var many_circles_size = 0

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    var make_boxes = function(colors_list) {
	
	// Given the parameters convert 
	//  start at -1,1 add 1/8 to each side
	//  
	//
	var res = []
	var step = 1/4
	var count = 0
	var y = 1
	for (let j = 0; j < 8; j += 1) {
	    count += 1
	    for (let i = 0; i < 8; i++) {
		var x = -1	    
		// if y is even then start with 0
		// odd start with 1
		var color_i = 0
		if (count % 2 != 0) {
		    color_i = i % 2 == 0 ? 1 : 0
		}
		if (count % 2 == 0) {
		    color_i = i % 2 == 0 ? 0 : 1
		}
		res.push(vec2(x + (i * step), y - (j * step)))
		res.push(vec2(x + (i * step) + step, y - (j * step)))
		res.push(vec2(x + (i * step), y - (j * step) - step))
		res.push(vec2(x + (i * step) + step, y - (j * step) - step))
		colors_list.push(vec3(color_i, color_i, color_i))
		colors_list.push(vec3(color_i, color_i, color_i))
		colors_list.push(vec3(color_i, color_i, color_i))
		colors_list.push(vec3(color_i, color_i, color_i))
	    } 
	}

	return res

    }

    var many_circles = function(color_list) {

	var res = []
	var start_x = -1
	var start_y = 1
	var step = 0.25
	for (let y = 0; y < 8; y++) {
	    for (let x = 0; x < 4; x++) {
		
		// The x value is x + half the step
		// The y values is y - half the step
		var skip_x = y % 2 == 0 ? start_x: start_x + step
		var x_pos = (skip_x + (x * step * 2) + (step / 2))
		var y_pos = (start_y - (y * step) - (step / 2))
		if (!(y == 3 || y == 4)) {
		    var circle_new = circle_calc(x_pos, y_pos, 0.1, 0.07, vec3(0,1,1), color_list)
		    many_circles_size = circle_new.length
		    res = res.concat(circle_new)
		}

	    	
	    }
	}
	return res
    }

    // Math to figure out a circle
    // x = cos(theta)
    // y = sin(theta)

    // rsin and rcos for TODO

    // To displace the circle you can 
    var color_hollow_circle = []
    var color_filled_circle = []
    var color_rect = [
	vec3(1,0,1),
	vec3(0.5,0,1),
	vec3(1,0.3,1),
	vec3(0,0,1),
    ]

    var rectangle = [
	vec2(-0.3,0),
	vec2(-0.3,0.6),
	vec2(0,0),
	vec2(0,0.6),
    ]



    // Returns a list of points given these values // color vec3
    var circle_calc = function (x,y,step,radius, color, color_list) {
	var returnList = []
	for (let i = 0; i <= 6.28; i+=step) {
	    returnList.push(vec2(radius * Math.cos(i) + x, radius * Math.sin(i) + y))
	    color_list.push(color)
	}
	return returnList
    }

    var circle = circle_calc(-0.3,0,0.1,0.5, vec3(0,0,1), color_hollow_circle)
    circle_length = circle.length

    // Board made here
    var board_colors = []
    var board = make_boxes(board_colors)
    console.log("here")
    console.log(board_colors)

    // Checkers made here
    var tons_circles_colors = []
    var tons_circles = many_circles(tons_circles_colors)
    console.log(many_circles_size)

    // make the super list
    board = board.concat(tons_circles)
    console.log(final_list)
    board_colors = board_colors.concat(tons_circles_colors)
    console.log(board_colors)

    var circle_filled = circle_calc(-0.7,0,0.1,0.3, vec3(1,0,1), color_filled_circle)
    circle_filled_length = circle.length

    // Three Vertices        
    var final_list = circle.concat(circle_filled).concat(rectangle)
    var colors = color_hollow_circle.concat(color_filled_circle).concat(color_rect)

    // Configure WebGL   
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );   
 
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        

    // Load the data into the GPU       
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(board_colors), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");    
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);    

    // Load the data into the GPU       
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    console.log(flatten(tons_circles).length/2)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(board), gl.STATIC_DRAW);
   
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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 256)

    var start = 256
    for (let i = 0; i <= many_circles_size; i++) {
      gl.drawArrays(gl.TRIANGLE_FAN, start + (i * many_circles_size), many_circles_size);
    }

    // gl.drawArrays(gl.TRIANGLE_FAN, circle_length, circle_filled_length);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 126, 4);
}
