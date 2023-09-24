// Malcolm Kahora
"use strict";

var gl;
var points;

var circle_length = 0;
var circle_filled_length = 0;
var rect_length = 4;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    var many_circles_size = 0

    var many_circles = function(color_list) {

	var res = []
	var start_x = -1
	var start_y = 1
	var step = 0.25
	for (let y = 0; y < 8; y++) {
	    for (let x = 0; x < 8; x++) {
		
		// The x value is x + half the step
		// The y values is y - half the step
		var x_pos = (start_x + (x * step) + (step / 2))
		var y_pos = (start_y - (y * step) - (step / 2))
		var circle_new = circle_calc(x_pos, y_pos, 0.1, 0.07, vec3(0,1,1), color_list)
		many_circles_size = circle_new.length

		res = res.concat(circle_new)
	    	
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

    var tons_circles_colors = []
    var tons_circles = many_circles(tons_circles_colors)
    console.log(tons_circles)
    console.log(many_circles_size)

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tons_circles_colors), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");    
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);    

    // Load the data into the GPU       
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    console.log(flatten(tons_circles).length/2)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tons_circles), gl.STATIC_DRAW);
   
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);    

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT); 
    // gl.drawArrays(gl.LINE_LOOP, 0, 3)
    // gl.drawArrays(gl.TRIANGLES, 3, 3);
    var start = 0
    for (let i = 0; i < 64; i++) {
      gl.drawArrays(gl.TRIANGLE_FAN, start + (i * 63), 63);
    }
    // gl.drawArrays(gl.TRIANGLE_FAN, circle_length, circle_filled_length);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 126, 4);
}
