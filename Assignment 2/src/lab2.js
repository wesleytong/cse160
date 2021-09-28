//lab2.js
//based on work found in text and supplementary website
//Wesley Tong
//wtong5@ucsc.edu

//shader functions 
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ModelMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
	
var ModelMatrix;
//global variable so it can be passed through draw 
var animation = 0;

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
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if(!u_ModelMatrix){
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}	
	gl.enable(gl.DEPTH_TEST);
	//sets viewpoint (from text)
	ModelMatrix = new Matrix4();
	ModelMatrix.setPerspective(30, 1, 1, 100);
	//setLookAt doesn't allow for the picture to be seen at first, lookAt works instead
	ModelMatrix.lookAt(5, 3, 5, 0, 0, 0, 0, 1, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, ModelMatrix.elements);
	//get value of slider for rotation 
	var slider = document.getElementById('rotate');
	slider.oninput = function(){
		var rotation = slider.value;
		ModelMatrix.setPerspective(30, 1, 1, 100);
		ModelMatrix.lookAt(5, 3, 5, 0, 0, 0, 0, 1, 0);
		ModelMatrix.rotate(rotation, 0, 1, 0);
		gl.uniformMatrix4fv(u_ModelMatrix, false, ModelMatrix.elements);
		createDog(gl);
	}
	createDog(gl);
	var tick = function(){
		animation = animate(animation);
		createDog(gl);
		requestAnimationFrame(tick);
	}
	tick();
}

//function to draw cube - within initVertexBuffers  
function initVertexBuffers(gl,r,g,b){
	//first create an array to store vertices 
	var vertices = new Float32Array([   
        0.5, 0.5, 0.5,   -0.5, 0.5, 0.5,   -0.5,-0.5, 0.5,    0.5,-0.5, 0.5,  
        0.5, 0.5, 0.5,    0.5,-0.5, 0.5,    0.5,-0.5,-0.5,    0.5, 0.5,-0.5,  
        0.5, 0.5, 0.5,    0.5, 0.5,-0.5,   -0.5, 0.5,-0.5,   -0.5, 0.5, 0.5,  
       -0.5, 0.5, 0.5,   -0.5, 0.5,-0.5,   -0.5,-0.5,-0.5,   -0.5,-0.5, 0.5,  
       -0.5,-0.5,-0.5,    0.5,-0.5,-0.5,    0.5,-0.5, 0.5,   -0.5,-0.5, 0.5,  
        0.5,-0.5,-0.5,   -0.5,-0.5,-0.5,   -0.5, 0.5,-0.5,    0.5, 0.5,-0.5   
    ]);
	//then create similar array for colors just consisting of rgb for colors 
    var colors = new Float32Array([    
        r, g, b,   r, g, b,   r, g, b,    r, g, b,   
        r, g, b,   r, g, b,   r, g, b,    r, g, b,   
        r, g, b,   r, g, b,   r, g, b,    r, g, b,
        r, g, b,   r, g, b,   r, g, b,    r, g, b, 
        r, g, b,   r, g, b,   r, g, b,    r, g, b,  
        r, g, b,   r, g, b,   r, g, b,    r, g, b,  
    ]);		
	var indices = new Uint8Array([ 0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23]);	
	//buffer objects:
	var buffer = gl.createBuffer();
	if(!buffer){
		return -1;
	}
	// Write vertex coordinates and color to buffer object 
	if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')){
		return -1
	}
	if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')){
		return -1;
	}
	//Writes indices to the buffer object 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;
}

function createDog(gl){
	// from instructions
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    // rotate remains the same throughout all 
	var rotate = [0, 0, 0, 1]; 
    // body
    var translate = [0,0,0];
    var scale = [1,0.6,1.2];
    draw(gl, translate, scale, rotate, 1, .84, 0,animation);
	// front legs
    var translate = [0.2,-.25,0.5];
    var scale = [0.2,0.8,0.2];
    draw(gl, translate, scale, rotate, 1, .84, 0,animation*-1.2);
    var translate = [-0.2,-.25,0.5];
    var scale = [0.2,0.8,0.2];
    draw(gl, translate, scale, rotate, 1, .84, 0,animation*-1.2);
	// front paws 
    var translate = [0.2,-.3,0.5];
    var scale = [0.18,0.78,0.18];
    draw(gl, translate, scale, rotate, .6, .4, 0,animation*-1.2);	
	var translate = [-0.2,-.3,0.5];
    var scale = [0.18,0.78,0.18];
    draw(gl, translate, scale, rotate, .6, .4, 0,animation*-1.2);	
    // back legs
    var translate = [0.2,-.25,-0.5];
    var scale = [0.2,0.8,0.2];
    draw(gl, translate, scale, rotate, 1, .84, 0,animation*-1.2);
	var translate = [-0.2,-.25,-0.5];
    var scale = [0.2,0.8,0.2];
    draw(gl, translate, scale, rotate, 1, .84, 0,animation*-1.2);
	// back paws 
	var translate = [0.2,-.3,-0.5];
    var scale = [0.18,0.78,0.18];
    draw(gl, translate, scale, rotate, .6, .4, 0,animation*-1.2);	
	var translate = [-0.2,-.3,-0.5];
    var scale = [0.18,0.78,0.18];
    draw(gl, translate, scale, rotate, .6, .4, 0,animation*-1.2);	
    // tail, set animation higher to give more "wagging" look 
    var translate = [0,.05,-.9];
    var scale = [0.1,0.1,.6];
    draw(gl, translate, scale, rotate, 0.6, 0.4, 0,animation*-1.3);	
	// head
    var translate = [0,0.2,0.85];
    var scale = [0.65,0.55,0.5];
    draw(gl, translate, scale, rotate, .6, .4, 0,animation*0.8);
    // ears
    var translate = [0.35,0.25,0.85];
    var scale = [0.1,0.35,0.1];
    draw(gl, translate, scale, rotate, 0, 0, 0, animation*.9);
    var translate = [-0.35,0.25,0.85];
    var scale = [0.1,0.35,0.1];
    draw(gl, translate, scale, rotate, 0, 0, 0, animation*.9);
    // eyes
    var translate = [0.15,0.35,1.1];
    var scale = [0.12,0.12,0.12];
    draw(gl, translate, scale, rotate, 0, 0, 0,animation*0.8);
    var translate = [-0.15,0.35,1.1];
    var scale = [0.12,0.12,0.12];
    draw(gl, translate, scale, rotate, 0, 0, 0,animation*0.8);
    var translate = [0.15,0.34,1.15];
    var scale = [0.05,0.05,0.03];
    draw(gl, translate, scale, rotate, .1, .6, .0,animation*0.8);
    var translate = [-0.15,0.34,1.15];
    var scale = [0.05,0.05,0.03];
    draw(gl, translate, scale, rotate, .1, .6, .0,animation*0.8);
    // nose
    var translate = [0,0.18,1.1];
    var scale = [0.07,0.04,0.05];
    draw(gl, translate, scale, rotate, 0, 0, 0,animation*0.8);
    // mouth
    var translate = [0.0,0.05,1.1];
    var scale = [0.2 ,0.10,0.05];
    draw(gl, translate, scale, rotate, 1, 0.6, 0.6,animation*.8);
}

//based off of website, but modifications needed to work 
function draw(gl, translate, scale, rotate, r, g, b, angle){
	var n = initVertexBuffers(gl,r,g,b);
	
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	var transformedMatrix = new Matrix4();
	transformedMatrix.setRotate(angle,1,0,0);
    transformedMatrix.translate(translate[0], translate[1], translate[2]);
    transformedMatrix.translate(rotate[0],rotate[1],rotate[2]);
    transformedMatrix.scale(scale[0], scale[1], scale[2]);
    var newMatrix = new Matrix4();
    newMatrix.set(ModelMatrix).multiply(transformedMatrix);
    gl.uniformMatrix4fv(u_ModelMatrix,false,newMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

//similar to initVertexBuffers from lab 1 
function initArrayBuffer(gl, data, num, type, value) {
    var buffer = gl.createBuffer();   
    // Bind the buffer object to target 
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	// Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to  variable
    var a_Value = gl.getAttribLocation(gl.program, value);
    //Assign the buffer object to variable 
    gl.vertexAttribPointer(a_Value, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_Value);
    return true;
}

//modified from text 
var positive = 1;
function animate(angle){
	if(positive == 1) {
        if(angle == 7) {
            positive = 0;
        }
        return angle+1;
    } else {
        if(angle == -7) {
            positive = 1;
        }
        return angle-1;
    }
}
