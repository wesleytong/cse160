// Vertex Shader
var VSHADER_SOURCE =
    "attribute vec4 a_Position;\n" +
    "attribute float a_Size;\n" +
    "void main() {\n" +
    " gl_Position = a_Position;\n" +  // Coordinates
    " gl_PointSize = a_Size;\n" +     // Set the point size
    "}\n";

// Fragment Shader
var FSHADER_SOURCE = 
    "precision mediump float;\n" +
    "uniform vec4 u_FragColor;\n" +
    "void main() {\n" +
    " gl_FragColor = u_FragColor;\n" + // Set the color
    "}\n";

// Slider and button variables
var r = 0.0;
var g = 0.0;
var b = 0.0;
var a = 0.0;
var s = 0.0;
var currentShape = 0; // 0 = triangle, 1 = square, 2 = circle
var segCount = 0;
function main() {
    var canvas = document.getElementById("webgl");
    var clear = document.getElementById("clear");
    var square = document.getElementById("square");
    var triangle = document.getElementById("triangle");
    var circle = document.getElementById("circle");
    var red = document.getElementById("red");
    var redInput = document.getElementById("redInput");
    var green = document.getElementById("green");
    var greenInput = document.getElementById("greenInput");
    var blue = document.getElementById("blue");
    var blueInput = document.getElementById("blueInput");
    var alpha = document.getElementById("transparency");
    var alphaInput = document.getElementById("alphaInput");
    var size = document.getElementById("size");
    var sizeInput = document.getElementById("sizeInput");
    var segment = document.getElementById("segment");
    var segInput = document.getElementById("segInput");
    var mouseDown = false;
    var gl = getWebGLContext(canvas);
    r = red.value/255;
    g = green.value/255;
    b = blue.value/255;
    a = alpha.value/255;
    s = size.value;
    segCount = segment.value;
    if(!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }  

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders.");
        return;
    }
    
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    var a_Size = gl.getAttribLocation(gl.program, "a_Size");
    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    console.log(a_Size);
    canvas.onmousedown = function(ev) {
        mouseDown = true; 
        click(ev, gl, canvas, a_Position, a_Size, u_FragColor);
    };
    canvas.onmousemove = function(ev) {
        if(!mouseDown) {
            return;
        } else {
            click(ev, gl, canvas, a_Position, a_Size, u_FragColor);
        }
    }
    canvas.onmouseup = function() {
        mouseDown = false;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    clear.onclick = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        g_points = [];
        g_colors = [];
        g_size = [];
        g_shape = [];
    };

    triangle.onclick = function() {
        console.log("Triangle selected");
        currentShape = 0;
    };

    square.onclick = function() {
        console.log("Square selected");
        currentShape = 1;
    };

    circle.onclick = function() {
        console.log("Circle selected");
        currentShape = 2;
    };

    red.onchange = function() {
        r = red.value/255;
        console.log("RED CHANGED! VALUE: " + r);
        redInput.value = red.value;
    }

    redInput.onchange = function() {
        r = redInput.value/255;
        console.log("RED CHANGED! VALUE: " + r);
        red.value = redInput.value;
    }

    green.onchange = function() {
        g = green.value/255;
        console.log("GREEN CHANGED! VALUE: " + g);
        greenInput.value = green.value;
    }

    greenInput.onchange = function() {
        g = greenInput.value/255;
        console.log("GREEN CHANGED! VALUE: " + g);
        green.value = greenInput.value;
    }

    blue.onchange = function() {
        b = blue.value/255;
        console.log("BLUE CHANGED! VALUE: " + b);
        blueInput.value = blue.value;
    }

    blueInput.onchange = function() {
        b = blueInput.value/255;
        console.log("BLUE CHANGED! VALUE: " + b);
        blue.value = blueInput.value;
    }

    alpha.onchange = function() {
        a = alpha.value/255;
        console.log("Alpha CHANGED! VALUE: " + a);
        alphaInput.value = alpha.value;
    }

    alphaInput.onchange = function() {
        a = alphaInput.value/255;
        console.log("Alpha CHANGED! VALUE: " + a);
        alpha.value = alphaInput.value;
    }

    size.onchange = function() {
        s = size.value;
        console.log("SIZE CHANGED! VALUE: " + s);
        sizeInput.value=size.value;
    }
    
    sizeInput.onchange = function() {
        s = sizeInput.value;
        console.log("SIZE CHANGED! VALUE: " + s);
        size.value=sizeInput.value;
    }

    segment.onchange = function() {
        segCount = segment.value;
        console.log("SEGMENT CHANGED! VALUE: " + segCount);
        segInput.value = segment.value;
    }

    segInput.onchange = function() {
        segCount = segInput.value;
        console.log("SEGMENT CHANGED! VALUE: " + segCount);
        segment.value = segInput.value;
    }
}

var g_points = []; // The array for a mouse press
var g_shape = [];
var g_colors = []; // The array to store the color of a point
var g_size = [];
var g_segs = [];

function click(ev, gl, canvas, a_Position, a_Size, u_FragColor) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
    g_points.push([x, y]);
    g_colors.push([r, g, b, a]);
    g_size.push([s]);
    g_segs.push(segCount);
    if(currentShape == 0) {
        g_shape.push(0);
    } else if (currentShape == 1) {
        g_shape.push(1);
    } else if(currentShape == 2) {
        g_shape.push(2);
    }
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_points.length;
    for(var i = 0; i < len; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];
        var n = initVertexBuffers(gl,xy,g_size[i],a_Position,g_shape[i],g_segs[i]);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        // Draw a point
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}

function initVertexBuffers(gl, xy, size, a_Position, currShape, segs) {
    if(currShape == 0) { // draw triangle
        var verts = getTriangleVertices(xy[0],xy[1],size);
        var n = 3;
    } else if(currShape == 1) { // draw square
        var verts = getSquareVertices(xy[0],xy[1],size);
        var n = 6;
    } else if(currShape == 2) { // draw circle
        var verts = getCircleVertices(xy[0],xy[1],size,segs);
        var n = segs*3;
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

function getTriangleVertices(x,y,size) {
    var v1x = x;              // x coordinate for top vertex
    var v1y = y + size/100/2; // y coordinate for top vertex

    var v2x = x - size/100/2; // x coordinate for bottom left vertex
    var v2y = y - size/100/2; // y coordinate for bottom left vertex

    var v3x = x + size/100/2; // x coordinate for bottom right vertex
    var v3y = y - size/100/2; // y coordinate for bottom right vertex

    var triangleVertices = new Float32Array([
        v1x, v1y,   v2x,v2y,   v3x,v3y
    ]);
    return triangleVertices;
}

function getSquareVertices(x,y,size) {
    var v1x = x - size/100/2;
    var v1y = y + size/100/2;
    
    var v2x = x - size/100/2;
    var v2y = y - size/100/2;
    
    var v3x = x + size/100/2;
    var v3y = y - size/100/2;
    
    var v4x = x - size/100/2;
    var v4y = y + size/100/2;

    var v5x = x + size/100/2;
    var v5y = y - size/100/2;

    var v6x = x + size/100/2;
    var v6y = y + size/100/2;

    var squareVertices = new Float32Array([
        v1x, v1y,   v2x, v2y,   v3x, v3y,  v4x, v4y,   v5x, v5y,   v6x, v6y
    ]);
    return squareVertices;
}

function getCircleVertices(originX,originY,size,segs) {
    var circleVertices = [];
    var length = size/100/2;
    var secondX = originX;
    var secondY = originY + length;
    var degrees = 360/segs;
    for(var i = 1 ; i <= segs ; i++) {
        circleVertices.push(originX); // origin point X, start of every triangle
        circleVertices.push(originY); // origin point Y, start of every triangle
        circleVertices.push(secondX); // second X point of triangle
        circleVertices.push(secondY); // second Y point of triangle
        var thirdX = originX + Math.sin(radian(degrees*i))*length;
        var thirdY = originY + Math.cos(radian(degrees*i))*length;
        circleVertices.push(thirdX);  // third X point of triangle
        circleVertices.push(thirdY);  // third Y point of triangle
        secondX = thirdX;
        secondY = thirdY;
    }
    return new Float32Array(circleVertices);
}

function radian(degrees) {
    return degrees * (Math.PI/180);
}