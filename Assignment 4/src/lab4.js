//lab4.js
//based on work found in text and supplementary website
//Wesley Tong
//wtong5@ucsc.edu

//shader functions
var VSHADER_SOURCE =
    '#ifdef GL_ES\n' + 
    'precision mediump float;\n' + 
    '#endif\n' +    
   'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Normal;\n' + 
    'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
	'uniform vec4 u_FragColor;\n' + 
    'varying vec2 v_TexCoord;\n' +
	'varying vec3 v_Normal;\n' + 
	'varying vec3 v_Position;\n' + 
	'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_Color = u_FragColor;\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix*a_Normal));\n' + 
	'  v_Position = vec3(u_ModelMatrix * a_Position);\n' + 
	'}\n';

var TEXTUREVSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Normal;\n' + 
	'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec2 v_TexCoord;\n' +
	'varying vec3 v_Normal;\n' + 
	'varying vec3 v_Position;\n' + 
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix*a_Normal));\n' + 
	'  v_Position = vec3(u_ModelMatrix * a_Position);\n' + 
	'}\n';

var FSHADER_SOURCE =	
    '#ifdef GL_ES\n' + 
    'precision mediump float;\n' + 
    '#endif\n' + 
    'uniform sampler2D u_Sampler;\n' + 
    'uniform vec3 u_LightColor;\n' + 
    'uniform vec3 u_LightPosition;\n' + 
    'uniform vec3 u_EyePosition;\n' + 
    'uniform float u_Visualization;\n' + 
    'uniform float u_Lighting;\n' + 
    'varying vec3 v_Normal;\n' + 
    'varying vec3 v_Position;\n' + 
    'varying vec4 v_Color;\n' + 
    'void main() {\n' + 
    '    vec3 normal = normalize(v_Normal);\n' + 
    '   vec3 lightDirection = -normalize(u_LightPosition);\n' + 
    '    float nDotL = dot(lightDirection, normal);\n' + 
    '    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' + 
    '    vec3 ambient = u_LightColor * v_Color.rgb;\n' + 
    '    vec3 eyeVector = -normalize(v_Position - u_EyePosition);\n' + 
    '   vec3 rotationVector = 2.0 * nDotL * normal - lightDirection; \n' + 
    '    vec3 specular = u_LightColor * v_Color.rgb * pow(max(dot(eyeVector, rotationVector), 0.0), 64.0); \n' + 
    '    if(u_Visualization == 0.0 && u_Lighting == 0.0)\n' + 
    '        gl_FragColor = vec4(max(diffuse, 0.0) * 0.7 + ambient * 0.3 + 0.2 * specular, v_Color.a);\n' + 
    '    else if(u_Lighting == 1.0)\n' + 
    '        gl_FragColor = v_Color;\n' + 
    '   else if(u_Visualization == 1.0)\n' + 
    '        gl_FragColor = vec4(normalize(v_Normal + vec3(1.0,1.0,1.0)), v_Color.a);\n' + 
    '}\n';


var TEXTUREFSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +    
	'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
	
    'void main() {\n' +
    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '}\n';
var mouseDown = false;
var key  = {'w' : false, 'a' : false, 's' : false, 'd' : false, 'q' : false, 'e' : false};
//retrieve <canvas> element 
var canvas = document.getElementById('webgl');
var visualizationButtonClicked = false;
var lightingButtonClicked = false;
var rotation = 0;
let lightColor = new Vector3([1.0,1.0,1.0]);
let lightDirection = new Vector3([1.0,-1.0,0.0]);

function main(){

	//Gets rendering context for WebGL
	var gl = getRenderingContext();
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
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	var coloredCubes = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if(!coloredCubes){
		console.log("Failed to initialize colored cubes program");
	}
	var texturedCubes = createProgram(gl, TEXTUREVSHADER_SOURCE, TEXTUREFSHADER_SOURCE);
	if(!texturedCubes){
		console.log("Failed to initialize textured cubes program");
	}	
	setLocation(gl, coloredCubes, texturedCubes);
	var camera = setupCamera(gl, coloredCubes, texturedCubes);
	
	initTextureBuffers(gl);
	var texture = initTextureObjects(gl, texturedCubes);
	//translate then scale 
	const cubes = [
	new Cube(gl, [0,4,0], [3200,0.1,3200], [0.4,0.9,1.0,1.0]), //sky 
	new Cube(gl, [0,-1,0], [3200,0.1,3200],[0, 0.5, 0, 1.0]), //ground
	new Cube(gl, [12.5,0.1,0], [1,4,50], texture.wood), //4 corners 
    new Cube(gl, [-12.5,0.1,0], [1,4,50], texture.wood), 
	new Cube(gl, [0,0.1,12.5], [50,4,1], texture.wood), 
    new Cube(gl, [0,0.1,-12.5], [50,4,1], texture.wood),
	new Cube(gl, [-5,1,3], [2,2,2], [1,0,0,1]), 
    new Sphere(gl, [-3,1,3], [1,1,1], [0,0,1,1]),	
    new Sphere(gl, [-1,1,3], [2,2,2], [1,0,1,1]),
	new Sphere(gl, [2,1,3], [3,3,3],[1,1,1,1]),
	//animal
	//body
	new Cube(gl, [0,-.3,0], [1,0.6,1.2], [1, .84, 0, 1]),
	//front legs
	new Cube(gl, [.2,-.55,.25], [0.2,0.8,0.2], [1, .84, 0, 1]),
	new Cube(gl, [-0.2,-.55,0.25], [.2,.8,.2], [1,.84,0,1]),
	//front paws
	new Cube(gl, [.2, -.6,.25],[.18,.78,.18],[.6,.4,0,1]),
	new Cube(gl, [-.2,-.6,.25],[.18,.78,.18],[.6,.4,0,1]),
	//back legs
	new Cube(gl, [.2,-.55,-.25],[.2,.8,.2],[1,.84,0,1]),
	new Cube(gl, [-.2,-.55,-.25],[.2,.8,.2],[1,.84,0,1]),
	//back paws
	new Cube(gl, [.2,-.6,-.25],[.18,.78,.18],[.6,.4,0,1]),
	new Cube(gl, [-.2,-.6,-.25],[.18,.78,.18],[.6,.4,0,1]),
	//tail
	new Cube(gl, [0,-.25,.45],[.1,.1,.6],[.6,.4,0,1]),
	//head
	new Cube(gl, [0,-.15,-.4],[.65,.55,.5],[.6,.4,0,1]),
	//ears
	new Cube(gl, [.18,-.05,-.4],[.1,.35,.1],[0,0,0,1]),
	new Cube(gl, [-.18,-.05,-.4],[.1,.35,.1],[0,0,0,1]),
	//eyes
	new Cube(gl, [.08,-.05,-.5],[.12,.12,.12],[0,0,0,1]),
	new Cube(gl, [-.08,-.05,-.5],[.12,.12,.12],[0,0,0,1]),
	new Cube(gl, [.08, -.05, -.53],[.05,.05,.03],[.1,.6,0,1]),
	new Cube(gl, [-.08, -.05, -.53],[.05,.05,.03],[.1,.6,0,1]),
	//nose
	new Cube(gl, [0,-.12,-.53],[.07,.04,.05],[0,0,0,1]),
	//mouth 
	new Cube(gl, [0,-.18,-.53],[.2,.1,.05],[1,.6,.6,1])
	];
	visualizationButton();
	lightingButton();
	tick(gl, cubes, camera, coloredCubes, texturedCubes);
}

function getRenderingContext(){
	var gl = getWebGLContext(getCanvasElement(), false);
	if(!gl){
		console.log('Failed to get the rendering context for WebGL (Function getRenderingContext)');
		return;
	}
	return gl;
}
//used in getRenderingContext() as seen in book 
function getCanvasElement(){
	var canvas = document.getElementById("webgl");
	if(!canvas){
		console.log("Failed th retrieve the canvas element (Function getCanvasElement())");
		return;
	}
	return canvas;
}

function setLocation(gl, coloredCubes, texturedCubes){
	coloredCubes.a_Position =  gl.getAttribLocation(coloredCubes, 'a_Position');
    coloredCubes.u_ModelMatrix = gl.getUniformLocation(coloredCubes, 'u_ModelMatrix');
    coloredCubes.u_ViewMatrix = gl.getUniformLocation(coloredCubes, 'u_ViewMatrix');
    coloredCubes.u_ProjMatrix = gl.getUniformLocation(coloredCubes, 'u_ProjMatrix');	
    coloredCubes.u_Sampler = gl.getUniformLocation(coloredCubes, 'u_Sampler');	
	coloredCubes.u_FragColor = gl.getUniformLocation(coloredCubes, 'u_FragColor');
    coloredCubes.a_Normal = gl.getAttribLocation(coloredCubes, 'a_Normal');
    coloredCubes.u_NormalMatrix = gl.getUniformLocation(coloredCubes, 'u_NormalMatrix');
    coloredCubes.u_LightColor = gl.getUniformLocation(coloredCubes, 'u_LightColor');
    coloredCubes.u_LightPosition = gl.getUniformLocation(coloredCubes, 'u_LightPosition');
    coloredCubes.u_EyePosition = gl.getUniformLocation(coloredCubes, "u_EyePosition");
    coloredCubes.u_Visualization = gl.getUniformLocation(coloredCubes, 'u_Visualization');
    coloredCubes.u_Lighting = gl.getUniformLocation(coloredCubes, 'u_Lighting');	
	texturedCubes.a_Position =  gl.getAttribLocation(texturedCubes, 'a_Position');
    texturedCubes.u_ModelMatrix = gl.getUniformLocation(texturedCubes, 'u_ModelMatrix');
    texturedCubes.u_ViewMatrix = gl.getUniformLocation(texturedCubes, 'u_ViewMatrix');
    texturedCubes.u_ProjMatrix = gl.getUniformLocation(texturedCubes, 'u_ProjMatrix');
    texturedCubes.a_TexCoord = gl.getAttribLocation(texturedCubes, 'a_TexCoord');
    texturedCubes.u_Sampler = gl.getUniformLocation(texturedCubes, 'u_Sampler');	
    texturedCubes.a_Normal = gl.getAttribLocation(texturedCubes, 'a_Normal');
    texturedCubes.u_NormalMatrix = gl.getUniformLocation(texturedCubes, 'u_NormalMatrix');	
}

//book ch4
function tick(gl, cubes, camera, colored, textured){
	let priorTime = Date.now();
	//create rotation Matrix to initialize the light direction
	const rotationMatrix = new Matrix4(); 
    rotationMatrix.setRotate(0,0,1,0);
	const frameTick = function(){
		const deltaTime = (Date.now() - priorTime)/1000;
		priorTime = Date.now();
		rotateLight(rotationMatrix);
		camera.updateCamera(gl, deltaTime, colored, textured);
		renderFrame(gl, cubes, colored, textured);
		requestAnimationFrame(frameTick, canvas);
	}
	frameTick();
}
function rotateLight(rotationMatrix) {
    rotationMatrix.setRotate(rotation,0.0,1.0,0.0);
    rotation += (360/36)*0.05;
    lightDirection = rotationMatrix.multiplyVector3(new Vector3([1.0,-1.0,0]));
}

function renderFrame(gl, cubes, colorProgram, textureProgram) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    cubes.forEach( (elem) => elem.render(gl, colorProgram, textureProgram));
}

//textures - from ch 5
function initTextureBuffers(gl){
	const textureBuffer = gl.createBuffer();
	if(!textureBuffer) {
        console.log("Failed to create a buffer in initTextureBuffers()");
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoord, gl.STATIC_DRAW);
}

//from book ch 5
function initTextureObjects(gl, program) {

    const textures = [];
    const imgSrc = ['./textures/idk.jpg', './textures/sand.jpg', './textures/wood.png'];
                    
    for (let i = 0; i < 3; i++) {
        const texture = gl.createTexture();
        textures.push(texture);
        const image = new Image();
        
        if(!texture && !image) {
            console.log("Failed to create a texture object in initTextureObjects()");
            return;
        }
        image.onload = () => {loadTexture(gl, texture, image, program);};  
        image.src = imgSrc[i];
    }

    return {	
		idk: textures[0],
		sand: textures[1],
		wood: textures[2]
    }
}

function loadTexture(gl, texture, image, program) {
	//Flips image's y axis 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	//Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
	//Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
	//Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	//Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
 	//set the texture unit 0 to the sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);
	
}

// the texture coordinates of all cubes//
const textureCoord = [
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
];

//built with the use of book and some lab, esp chapter 7
class Camera {

    constructor(gl, color, texture) {
        this.eyePosition = [0, 0, -5];
        this.lookAtPosition = {x:0, y:0, z:1};
        this.yaw = 0;
        this.pitch = 0;

        this.projMatrix = new Matrix4();

        this.projMatrix.setPerspective(80, getCanvasElement().clientWidth/getCanvasElement().clientHeight, 0.03, 50000000);
        
        gl.useProgram(color);
        gl.uniformMatrix4fv(color.u_ProjMatrix,false,this.projMatrix.elements);
        
        gl.useProgram(texture);
        gl.uniformMatrix4fv(texture.u_ProjMatrix,false,this.projMatrix.elements);
    }
	
    updateView(gl, color, texture) {
        const viewMatrix = new Matrix4();
        
        if(key['q'] || key['e'] || mouseDown) {
            this.lookAtPosition.x = Math.cos(this.pitch)*Math.sin(this.yaw);
            this.lookAtPosition.y = Math.sin(this.pitch);
            this.lookAtPosition.z = Math.cos(this.pitch)*Math.cos(this.yaw);
			//added to check for mouse presses bc will flip if looking into the ground 
			if(mouseDown) {
                const smallestPitchAngle = Math.min(Math.PI/2-0.005, this.pitch);
                this.pitch = Math.max(-Math.PI/2+0.005, smallestPitchAngle);
                mouseDown = false;
            }
        }
        viewMatrix.setLookAt(this.eyePosition[0], this.eyePosition[1], this.eyePosition[2], this.eyePosition[0] + this.lookAtPosition.x, this.eyePosition[1] + this.lookAtPosition.y, this.eyePosition[2] + this.lookAtPosition.z, 0, 1, 0);
        gl.useProgram(color);
        gl.uniformMatrix4fv(color.u_ViewMatrix,false,viewMatrix.elements);
        gl.useProgram(texture);
        gl.uniformMatrix4fv(texture.u_ViewMatrix,false,viewMatrix.elements);
    }
	
    updateCamera(gl, delta, color, texture, event = undefined) {
        //adjusts the wasdqe movement speed and the precision of mouse movements - higher speed = faster momvement, lower precision = slower mouse 
		const speed = 3;
        const precision = 0.001;
		//sets viewing angles 
        var keysPressed = {0:null, 1:0, 2:180, 3:null, 4:90, 5:45, 6:135, 7:90, 8:270, 9:-45, 10:225, 11:270, 12:null, 13:0, 14:180, 15:null}; 
        const keyVal = key['w']*1 + key['s']*2 + key['a']*4 + key['d']*8;
        const angle = Math.PI*keysPressed[keyVal]/180;
        
        if (keysPressed[keyVal] !== null) {
            this.eyePosition[2] += Math.cos(this.yaw + angle)*delta*speed;
            this.eyePosition[0] += Math.sin(this.yaw + angle)*delta*speed;
        }
        if(key['q'])
            this.yaw += Math.PI/16 * delta;
        if(key['e'])
            this.yaw -= Math.PI/16 * delta;
		//with help of stackoverflow for mouse movement
        if(mouseDown && event !== undefined) {
            this.yaw -= event.movementX*precision;
            this.pitch -= event.movementY*precision;
        }
        this.updateView(gl, color, texture);
    }
}

function setupCamera(gl, color, texture) {

    const cam = new Camera(gl, color, texture);
    cam.updateView(gl, color, texture);

    document.onkeydown = (ev) => { 
		if(key.hasOwnProperty(ev.key)) key[ev.key] = true;
	};
    document.onkeyup = (ev) => { 
	key[ev.key] = false;
	};
	//prevents mouse from moving off screen
    canvas.onclick = () => {
		canvas.requestPointerLock();
	};
    document.onmousemove = (ev) => { 
		if(document.pointerLockElement === canvas || document.mozpointerLockElement === canvas) {
			mouseDown = true; 
            cam.updateCamera(gl, 0, color, texture, ev);
        }
	};
    return cam;
}

//functions for the buttons on page 
//added click functions in order to fix bug of visualization not working in certain circumstances. 
function visualizationButton(){
	function click(){
        visualizationButtonClicked = !visualizationButtonClicked;
		lightingButtonClicked = false;
    }
	const visualization = document.querySelector('input[id="visualization"]');
    visualization.addEventListener("click", click);
}

function changeVisualization(){
	if(!visualizationButtonClicked){
        document.getElementById("visualization").value = "No Visualization";
        document.getElementById("lighting").value = "No Lighting";		
    } 
	else{
        document.getElementById("visualization").value = "Visualization";
	}
}

function lightingButton(){	
	function click(){
        lightingButtonClicked = !lightingButtonClicked;
		visualizationButtonClicked = false;
    }
	const lighting = document.querySelector('input[id="lighting"]');
    lighting.addEventListener("click", click);
}

function changeLighting(){
    if(lightingButtonClicked)
        document.getElementById("lighting").value = "No Lighting";
    else{
        document.getElementById("lighting").value = "Lighting";
        document.getElementById("visualization").value = "Visualization";
	}	
}