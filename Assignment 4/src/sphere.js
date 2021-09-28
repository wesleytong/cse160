//built from supplementary website for WebGL Textbook ch 8
class Sphere {
   
    setSphereVertices(scale, translate) {
        const SPHERE_DIV = 80;
        var i, yaw, i1, i2;
        var j, pitch, j1, j2;
        var p1, p2;

        var positions = [];
        var vertices = [];

        // taken from textbook, chapter 8, used to generate spherical coordinates
        for (j = 0; j <= SPHERE_DIV; j++) {
            pitch = j * Math.PI / SPHERE_DIV;
            j1 = Math.sin(pitch);
            j2 = Math.cos(pitch);
            for (i = 0; i <= SPHERE_DIV; i++) {
                yaw = i * 2 * Math.PI / SPHERE_DIV;
                i1 = Math.sin(yaw);
                i2 = Math.cos(yaw);
                positions.push([i1 * j1, j2, i2 * j1]);
            }
        }
        // Generate indices
        for (j = 0; j < SPHERE_DIV; j++) {
            for (i = 0; i < SPHERE_DIV; i++) {
                p1 = j * (SPHERE_DIV+1) + i;
                p2 = p1 + (SPHERE_DIV+1);
                vertices.push(...positions[p1]);
                vertices.push(...positions[p2]);
                vertices.push(...positions[p1 + 1]);
                vertices.push(...positions[p1 + 1]);
                vertices.push(...positions[p2]);
                vertices.push(...positions[p2 + 1]);
            }
        }
		
        var tempVertices = [];
        for (var i = 0; i < vertices.length; i += 3) {
            tempVertices.push(...vertices.slice(i, i + 3));
            tempVertices.push(...vertices.slice(i, i + 3));
        }
        vertices = [...tempVertices];
        vertices = vertices.map((elem, index) => {
            if(index % 6 < 3){ 
				return elem * scale[index % 3] + translate[index % 3];
			}
            return elem;
            });
        return new Float32Array(vertices);
    }

    initVertexBuffers(gl) {
        this.verterBuffer = gl.createBuffer();
        if(!this.verterBuffer) {
            console.log("Failed to create a buffer in initVertexBuffers() in Sphere.js");
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    render(gl, color, texture) {
        const FSIZE = this.vertices.BYTES_PER_ELEMENT;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verterBuffer);
        gl.useProgram(color);
        visualizationButtonClicked ? gl.uniform1f(color.u_Visualization, 1.0) : gl.uniform1f(color.u_Visualization, 0.0);
        lightingButtonClicked ? gl.uniform1f(color.u_Lighting, 1.0) : gl.uniform1f(color.u_Lighting, 0.0);
        gl.vertexAttribPointer(color.a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
        gl.enableVertexAttribArray(color.a_Position);
        gl.vertexAttribPointer(color.a_Normal, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
        gl.enableVertexAttribArray(color.a_Normal);
        gl.uniform4f(color.u_FragColor, ...this.color);
        gl.uniformMatrix4fv(color.u_ModelMatrix, false, (new Matrix4()).setTranslate(...this.translate).elements);
        gl.uniform3fv(color.u_LightColor, lightColor.elements);
        gl.uniform3fv(color.u_LightPosition, lightDirection.elements);
        gl.uniformMatrix4fv(color.u_NormalMatrix, false, this.normalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
    }
	constructor(gl, translate = [0,0,0], scale = [1,1,1], color = [1,1,1,1]) {
		this.modelMatrix = new Matrix4();
        this.normalMatrix = new Matrix4();
		this.translate = translate;
		this.scale = scale;
        this.color = color;
        this.vertices = this.setSphereVertices(this.scale, this.translate);
        this.modelMatrix.setTranslate(...translate);
        this.normalMatrix.setInverseOf(this.modelMatrix);
        this.normalMatrix.transpose();
        this.initVertexBuffers(gl);
    }
}
