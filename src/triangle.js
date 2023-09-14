"use strict";

var gl;
var points;

var circle_length = 0;
var circle_filled_length = 0;

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

    var colors2 = [vec3(1,0,0)]
    // Returns a list of points given these values
    var circle_calc = function (x,y,step,radius) {
	var returnList = []
	for (let i = 0; i <= 6.28; i+=step) {
	    returnList.push(vec2(radius * Math.cos(i) + x, radius * Math.sin(i) + y))
	    colors2.push(vec3(1,0,0))
	}
	return returnList
    }

    var circle = circle_calc(0.5,0,0.1,0.5)
    circle_length = circle.length


    var circle_filled = circle_calc(0,0,0.1,0.5)
    circle_filled_length = circle.length

    console.log(circle)
    // Three Vertices        
    var vertices = [
        vec2(-1, -1),
        vec2(-0.5, 1),
        vec2(0, -1)    
    ];

    var final_list = circle.concat(circle_filled)
    // var colors = [
    //     vec3(1, 0, 0),
    //     vec3(0, 1, 0),
    //     vec3(0, 0, 1)
    // ];
        
    // vertices.push(vec2(0.1, -0.5));
    // colors.push(vec3(1,0,0));
    // vertices.push(vec2(0.5, 1));
    // colors.push(vec3(1,0,0));
    // vertices.push(vec2(1, -1));
    // colors.push(vec3(1,0,0));
 


    // Configure WebGL   
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );   
 
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        
    this.console.log("message");

    // Load the data into the GPU       
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");    
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);    

    // Load the data into the GPU       
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(final_list), gl.STATIC_DRAW);
   
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
}
