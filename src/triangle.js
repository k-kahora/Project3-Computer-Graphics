// Malcolm Kahora
"use strict";

var gl;
var points;

var circle_length = 0;
var circle_filled_length = 0;
var rect_length = 4;
var shapes = [] // Name of shape, list of values get the length easuly by length of list of values // also color
// {name: String, points: Array, color: Array}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    // Math to figure out a circle
    // x = cos(theta)
    // y = sin(theta)

    // rsin and rcos for TODO

    // To displace the circle you can 
    var color_hollow_circle = []
    var color_filled_circle = []
    var color_rect = [
	vec3(1,1,1),
	vec3(0,0,0),
	vec3(1,1,1),
	vec3(0,0,0),
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

    // Use a hash table to store each list
    var circle = circle_calc(-0.3,0,0.1,0.5, vec3(0,0,1), color_hollow_circle)
    circle_length = circle.length


    var circle_filled = circle_calc(-0.7,0,0.1,0.3, vec3(1,0,1), color_filled_circle)
    circle_filled_length = circle_filled.length

    // Three Vertices        
    var final_list = circle.concat(circle_filled).concat(rectangle)
    var colors = color_hollow_circle.concat(color_filled_circle).concat(color_rect)
    var get_points = function(shapes) {

	var res = []
	// TODO 0 is there so that when I get the points not the color
	for (let shape = 0; shape < shapes.length; shape++) {
	    for (let point = 0; point < shapes[shape].points.length; point++) {
		res.push(shapes[shape].points[point])
	    }
		
	} 
	return res


    }

    var make_boxes = function(row, col) {
	
	
	// Given the parameters convert 
	//  start at -1,1 add 1/8 to each side
	//  
	var res = []
	var step = 1/row
	for (let i = 0; i < row; i++) {
	    var x = -1	    
	    var y = 1	    
		res.push(vec2(x + (i * step), y))
		res.push(vec2(x + (i * step) + step, y))
		res.push(vec2(x + (i * step), y - step))
		res.push(vec2(x + (i * step) + step, y - step))
		colors.push(vec3(1,1,1))
		colors.push(vec3(1,1,1))
		colors.push(vec3(1,1,1))
		colors.push(vec3(1,1,1))
	} 

	console.log(res)
	return res

    }

    shapes.push({"points": circle_filled})
    shapes.push({"points": circle})
    shapes.push({"points": rectangle})
    shapes.push({"points": make_boxes(8,8)})

    console.log(get_points(shapes))

    // Configure WebGL   
    //
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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(get_points(shapes)), gl.STATIC_DRAW);
   
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
    gl.drawArrays(gl.LINE_LOOP, 0, circle_length);
    gl.drawArrays(gl.TRIANGLE_FAN, circle_length, circle_filled_length);
    console.log(shapes[3].points.length)
    gl.drawArrays(gl.TRIANGLE_STRIP, circle_length + circle_filled_length, 4);
    gl.drawArrays(gl.TRIANGLE_STRIP, circle_length + circle_filled_length + 4, shapes[3].points.length );
}
