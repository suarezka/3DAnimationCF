/**
 * Created by Nate Benson on 3/13/2017.
 */

class PatrickHouse {
    constructor (gl) {
        let baseColor = vec3.fromValues(30.0/255, 30.0/255, 30.0/255);
        let rodColor = vec3.fromValues(200/255, 200/255, 0);

        this.base = new UniSphere(gl, 0.3, 4);
        this.rod = new Cylinder(gl, 0.012, 0.012, 0.2, 8, rodColor, rodColor);
        this.rod2 = new Cylinder(gl, 0.012, 0.012, 0.18, 8, rodColor, rodColor);
        this.rod3 = new Cone(gl, 0.025, 0.035, 8, 1, rodColor, rodColor);
        this.rod4 = new Cylinder(gl, 0.012, 0.012, 0.06, 8, rodColor, rodColor);

        // Rod
        let move = vec3.fromValues(0, 0, 0.27);
        this.rodTransform = mat4.create();
        let moveRod = mat4.fromTranslation(mat4.create(), move);
        mat4.multiply(this.rodTransform, moveRod, this.rodTransform);

        let move2 = vec3.fromValues(0, 0, 0.38);
        this.rod2Transform = mat4.create();
        mat4.rotateY(this.rod2Transform, this.rod2Transform, Math.PI/2);
        mat4.rotateX(this.rod2Transform, this.rod2Transform, -Math.PI/4);
        let move2Rod = mat4.fromTranslation(mat4.create(), move2);
        mat4.multiply(this.rod2Transform, move2Rod, this.rod2Transform);

        let move3 = vec3.fromValues(0.067, 0.067, 0.38);
        this.rod3Transform = mat4.create();
        mat4.rotateY(this.rod3Transform, this.rod3Transform, Math.PI/2);
        mat4.rotateX(this.rod3Transform, this.rod3Transform, -Math.PI/4);
        let move3Rod = mat4.fromTranslation(mat4.create(), move3);
        mat4.multiply(this.rod3Transform, move3Rod, this.rod3Transform);

        let move4 = vec3.fromValues(-0.067, -0.067, 0.38);
        this.rod4Transform = mat4.create();
        let move4Rod = mat4.fromTranslation(mat4.create(), move4);
        mat4.multiply(this.rod4Transform, move4Rod, this.rod4Transform);

        this.tmp = mat4.create();
    }
    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        gl.uniform3fv(objTintUnif, vec3.fromValues(30.0/255, 30.0/255, 30.0/255));
        this.base.draw(vertexAttr, colorAttr, modelUniform, coordFrame);

        mat4.mul (this.tmp, coordFrame, this.rodTransform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(200/255, 200/255, 0));
        this.rod.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.rod2Transform);
        this.rod2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.rod3Transform);
        this.rod3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.rod4Transform);
        this.rod4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}