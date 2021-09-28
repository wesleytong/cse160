//moved creation of cube from main as seen in lab 2 to a new class with references from book (largely chapter 10)

const ANGLE_STEP = 90.0;

//using uv coordinates from the book
const front = [
    [0.5,  0.5,  0.5, 0.0, 1.0],
    [0.5, -0.5,  0.5, 0.0, 0.0],
    [0.5, -0.5, -0.5, 1.0, 0.0],
    [0.5, -0.5, -0.5, 1.0, 0.0],
    [0.5,  0.5,  0.5, 0.0, 1.0],
    [0.5,  0.5, -0.5, 1.0, 1.0]
];

function rotate(vertex, texture, angle, axis) {

    const matrix = new Matrix4();
    matrix.elements[0] = vertex[0]; // x value
    matrix.elements[4] = vertex[1]; // y value
    matrix.elements[8] = vertex[2]; // z value
    matrix.rotate(angle, axis.x, axis.y, axis.z);
    if(!texture){    
        return [matrix.elements[0], matrix.elements[4], matrix.elements[8]];
	}
    return [matrix.elements[0], matrix.elements[4], matrix.elements[8], vertex[3], vertex[4]];  
}

class Cube{
	static setCubeVertices(scale, texture, translate = [0,0,0]){
		var cube = [];
		var count = 0;
		for(var i = 0; i < 6; i++){
			for(var j = 0; j < front.length; j++){
				const vertex = front[j];
				if(i < 4){
					cube.push(...rotate(vertex, texture, ANGLE_STEP * i, {x:0, y:1, z:0}));
				}
				//"strict equality"
				else if(i === 4) 
                    cube.push(...rotate(vertex, texture, ANGLE_STEP, {x: 0, y: 0, z: 1})); 
                else 
                    cube.push(...rotate(vertex, texture, -ANGLE_STEP, {x: 0, y: 0, z: 1}));  
			}	
		}
		var tempCube = [];
		const incrementAmount = texture ? 5 : 3;
        for (let i = 0; i < cube.length; i += incrementAmount) {
            tempCube.push(...cube.slice(i, i + incrementAmount));
            const j = Math.floor(i / cube.length * normalVertices.length);
            tempCube.push(...normalVertices[j]);
        }
        cube = [...tempCube];		
		//arrow functions - written with stackoverflow help
		cube = cube.map((elem, index)=>{
			if(!texture && index%6 < 3){
				return elem * scale[index%6] + translate[index%6];
			}
			else if(texture && index%8 < 3){
				return elem* scale[index%8] + translate[index%8];
			}
			else{
				return elem;
			}
		});
		return new Float32Array(cube);
	}
	
	initVertexBuffers(gl){
		this.vertexBuffer = gl.createBuffer();
		if(!this.vertexBuffer){
			console.log("Failed to create a buffer in cube class");
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}
	
	render(gl, color, texture, original = new Matrix4()){
		const SIZE = this.vertices.BYTES_PER_ELEMENT;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);		
		var final = new Matrix4(original);
		final.multiply(this.modelMatrix);
        if (this.color){
            gl.useProgram(color);
			visualizationButtonClicked ? gl.uniform1f(color.u_Visualization, 1.0) : gl.uniform1f(color.u_Visualization, 0.0);
            lightingButtonClicked ? gl.uniform1f(color.u_Lighting, 1.0) : gl.uniform1f(color.u_Lighting, 0.0);			
            gl.vertexAttribPointer(color.a_Position, 3, gl.FLOAT, false, SIZE*6, 0);
            gl.enableVertexAttribArray(color.a_Position);
			gl.vertexAttribPointer(color.a_Normal, 3, gl.FLOAT, false, SIZE*6, SIZE*3);
			gl.enableVertexAttribArray(color.a_Normal);
            gl.uniform4f(color.u_FragColor, ...this.color);
            gl.uniformMatrix4fv(color.u_ModelMatrix, false, (new Matrix4()).setTranslate(...this.translate).elements);
        } 
		else{
            gl.useProgram(texture);
            gl.vertexAttribPointer(texture.a_Position, 3, gl.FLOAT, false, SIZE*8, 0);
            gl.enableVertexAttribArray(texture.a_Position);
            gl.uniformMatrix4fv(texture.u_ModelMatrix, false, (new Matrix4()).setTranslate(...this.translate).elements);

            gl.vertexAttribPointer(texture.a_TexCoord, 2, gl.FLOAT, false, SIZE*8, SIZE*3);
            gl.enableVertexAttribArray(texture.a_TexCoord);
            gl.vertexAttribPointer(texture.a_Normal, 3, gl.FLOAT, false, SIZE*8, SIZE*5);
			gl.enableVertexAttribArray(texture.a_Normal);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
        
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
    }
	
	constructor(gl, translate = [0, 0, 0], scale = [1,1,1], color = [1,1,1,1]){
		this.color = color.length ? color : undefined;
		this.texture = this.color ? undefined : color;
		this.vertices = Cube.setCubeVertices(scale, this.texture, translate);
		this.translate = translate;
		this.scale = scale;
		this.modelMatrix = new Matrix4();
        this.modelMatrix.setTranslate(...translate);
        this.normalMatrix = new Matrix4();
        this.normalMatrix.setInverseOf(this.modelMatrix);
        this.normalMatrix.transpose();		
		this.initVertexBuffers(gl);
	}
}
//default value
const normalVertices = [
    [1,0,0],
    [0,0,1],
    [-1,0,0],
    [0,0,-1],
    [0,-1,0],
    [0,1,0]
];
