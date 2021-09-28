//lab1.js
//based on work found in text and supplementary website
//My apologies for the code being a little messy, was my first time working with javascript and was learning as I went along. 
//Wesley Tong
//wtong5@ucsc.edu

//shader functions 
var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' + //attribute variable 
	'attribute float a_Size;\n' +
	'void main() {\n' + 
	' gl_Position = a_Position;\n' +
	' gl_PointSize = a_Size;\n' + 
	'}\n'; 

var FSHADER_SOURCE = 
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +
	'void main() {\n' +
	'  gl_FragColor = u_FragColor;\n' +
	'}\n';
 
	var r = 0.0;
	var g = 0.0;
	var b = 0.0;
	var a = 0.0;
	var shapeSize = 0.0;
	var segCount = 0.0; 
	var inputShape = 0; //0 is circle, 1 is triangle, 2 is square 

function main(){
	//retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	
	//Gets rendering context for WebGL
	var gl = getWebGLContext(canvas);
	//checks for failures
	if(!gl){
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	//initializes shaders 
	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log('Failed to initialize shaders.');
		return;
	}
	
	//finds storage location of a_Position
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position<0){
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	//finds storage location of u_FragColor
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if(!u_FragColor){
		console.log('Failed to get the storage location of u_FragColor');
		return;
	}

	var a_Size = gl.getAttribLocation(gl.program, 'a_Size');
	if(!a_Size){
		console.log('Failed to get the storage location of a_Size');
		return;
	}
	
	//creating event handler that is called on every mouse press
	//added bool var to track whether or not mouse was clicked 
	var isClick = false;
	canvas.onmousedown = function(ev){
		isClick = true;
		click(ev, gl, canvas, a_Position, a_Size, u_FragColor);
	};
	canvas.onmousemove = function(ev){
		if(!isClick){
			return;
		}
		else{
			click(ev, gl, canvas, a_Position, a_Size, u_FragColor);
		}
	};
	canvas.onmouseup = function(){
		isClick = false;
	}	

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	//for buttons on html page
	//clears the canvas 
	var clearBtn = document.querySelector(".toolbar1");
	clearBtn.onclick = function(){
        g_points = [];
        g_shape = [];
		g_colors = [];
        g_size = [];
        g_segs = [];
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

	}
	
	//can also use getElementById - used querySelector bc of Mozilla example
	var circle = document.querySelector(".Circle");
	circle.onclick = function(){
		inputShape = 0;
		console.log("Circle");
	}
	
	var triangle = document.querySelector(".Triangle");
	triangle.onclick = function(){
		inputShape = 1;
		console.log("Triangle");
	}
	
	var square = document.querySelector(".Square");
	square.onclick = function(){
		inputShape = 2;
		console.log("Square");
	}
	
	var segment = document.getElementById("segment");
	var alpha = document.getElementById("Alpha");
	var size = document.getElementById("Size");
	
	size.onchange = function(){
		shapeSize = size.value;
		console.log(shapeSize);
	}
	segment.onchange = function(){
		segCount = segment.value;
		console.log(segCount);
	}
	
	//grabs colors from sliders 
	var red = document.getElementById("Red");
	red.onchange = function(){
		r = red.value/255;
		console.log(r);
	}
	var green = document.getElementById("Green");
	green.onchange = function(){
		g = green.value/255;
		console.log(g);
	}
	var blue = document.getElementById("Blue");
	blue.onchange = function(){
		b = blue.value/255;
		console.log(b);
	}
	var alpha = document.getElementById("Alpha");
	alpha.onchange = function(){
		a = alpha.value/255;
		console.log(a);
	}
	//creates default values or else the first set of drawings do not work until ALL sliders are clicked lol 
	r = red.value/255;
    g = green.value/255;
    b = blue.value/255;
    a = alpha.value/255;
    shapeSize = size.value;
    segCount = segment.value;
}

var g_points = []; // The array for a mouse press
var g_shape = [];
var g_colors = []; // The array to store the color of a point
var g_size = [];
var g_segs = [];

//based off of examples online + textbook 
function click(ev, gl, canvas, a_Position, a_Size, u_FragColor) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
	//required functions to make alpha work 
	gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    g_points.push([x, y]);
    g_colors.push([r, g, b, a]);
    g_size.push([shapeSize]);
    g_segs.push(segCount);
    if(inputShape == 0) {
        g_shape.push(0);
    } else if (inputShape == 1) {
        g_shape.push(1);
    } else if(inputShape == 2) {
        g_shape.push(2);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_points.length;
    for(var i = 0; i < len; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];
        var n = initVertexBuffers(gl,xy,g_size[i],a_Position,g_shape[i],g_segs[i]);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}
//based off of examples online + textbook
function initVertexBuffers(gl, xy, size, a_Position, inputShape, segs) {
    if( inputShape == 0) {       
		var verts = getCircleVertices(xy[0],xy[1],size,segs);
        var n = segs*3;
    } else if(inputShape == 1) { 
        var verts = getTriangleVertices(xy[0],xy[1],size);
        var n = 3;
    } else if(inputShape == 2) { 
		var verts = getSquareVertices(xy[0],xy[1],size);
        var n = 6;
    }
    // The number of vertices
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("Failed to create the buffer object ");
        return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return n;
}

//convertor 
function radian(degrees){
	return degrees*(Math.PI/180);
}
function getCircleVertices(X, Y, size, segs){
	var circleVertices = [];
	var length = size/100/2;
	var x = X;
	var y = Y + length;
	var degrees = 360/segs; 
	
	//for loop that pushes the three points of triangles to form circle 
	//use of sin/cos functions per suggestions of Prof Davis on Piazza 
	for(var i = 1; i <=segs; i++){
		circleVertices.push(X);
		circleVertices.push(Y);
		circleVertices.push(x);
		circleVertices.push(y);
		var x0 = X + Math.sin(radian(degrees*i))*length;
		var y0 = Y + Math.cos(radian(degrees*i))*length;
		circleVertices.push(x0);
		circleVertices.push(y0);
		x = x0;
		y = y0;
	}
	return new Float32Array(circleVertices);
}
function getTriangleVertices(x, y, size){
	var x1 = x;					//coordinates for top vertices 
	var y1 = y + size/100/2;
	var x2 = x + size/100/2;	//coordinates for bottom right vertices 
	var y2 = y - size/100/2;
	var x3 = x - size/100/2;	//coordinates for bottom left vertices 
	var y3 = y - size/100/2;

	var triangleVertices = new Float32Array([
		x1, y1, x2, y2, x3, y3
	])
	return triangleVertices;
}
function getSquareVertices(x,y,size) {
    var x1 = x - size/100/2;
    var y1 = y - size/100/2;
    var x2 = x - size/100/2;
    var y2 = y + size/100/2;    
    var x3 = x + size/100/2;
    var y3 = y - size/100/2;    
    var x4 = x + size/100/2;
    var y4 = y + size/100/2;
    var x5 = x + size/100/2;
    var y5 = y - size/100/2;
    var x6 = x - size/100/2;
    var y6 = y + size/100/2;

    var squareVertices = new Float32Array([
        x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6
    ]);
    return squareVertices;
}
