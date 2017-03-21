/**
 * Created by kaye on 2/25/17.
 */
/**
 * Created by Hans Dulimarta on 2/16/17.
 */
class Pineapple {
    constructor (gl) {
        //Yellow + Brownish
        let baseColor = vec3.fromValues(1.0, 1.0, 0.0);
        let baseColor2 = vec3.fromValues(0.803922, 0.521569, 0.247059);

        //Green + Dark Green
        let crownColor = vec3.fromValues(0.0, 1.0, 0.0);
        let crownColor2 = vec3.fromValues(0.0, 0.392157, 0.0);

        //Pipe Color
        let pipeColor = vec3.fromValues(0.117647, 0.564706, 1);
        let windowColor = vec3.fromValues(0.529412, 0.807843, 0.980392);
        let windowColor2 = vec3.fromValues(0.429412, 0.707843, 0.940392);

        // Door Color
        let doorColor = vec3.fromValues(0.745098, 0.745098, 0.745098);


        this.base = new Cylinder(gl, 0.20, 0.15, 0.2, 16, baseColor, baseColor2);
        this.top = new Cylinder(gl, 0.20, 0.15, 0.2, 16, baseColor, baseColor2);
        this.c1 = new Cone(gl, 0.12, 0.2, 15, 1, crownColor, crownColor2);
        this.c2 = new Cone(gl, 0.11, 0.2, 15, 1, crownColor, crownColor2);
        this.c3 = new Cone(gl, 0.1, 0.2, 15, 1, crownColor, crownColor2);
        this.pipe1 = new Cylinder(gl, 0.01, 0.01, 0.2, 15, pipeColor, pipeColor);
        this.pipe2 = new Cylinder(gl, 0.05, 0.01, 0.1, 15, pipeColor, pipeColor);
        this.window1 = new Ring(gl, 0.05, 0.025, 0.1, 10, 4, windowColor, windowColor2);
        this.window2 = new Ring(gl, 0.05, 0.025, 0.1, 10, 4, windowColor, windowColor2);
        this.door = new Cylinder(gl, 0.06, 0.06, 0.1, 10, pipeColor, pipeColor);
        this.door2 = new Cube(gl, 0.12, 4, pipeColor, pipeColor, pipeColor);


        //Repositioning for Base and Top
        let moveBaseUp = vec3.fromValues(0, 0, 0.1);
        this.baseTransform = mat4.create();
        mat4.fromTranslation(this.baseTransform, moveBaseUp);

        let moveUp = vec3.fromValues (0, 0, 0.3);
        this.topTransform = mat4.create();
        mat4.rotateY(this.topTransform, this.topTransform, Math.PI);
        let moveUpTop = mat4.fromTranslation(mat4.create(), moveUp);
        //crownTransform = moveUpCrown * crownTransform
        mat4.multiply (this.topTransform, moveUpTop, this.topTransform);

        //Side Pipe
        let move = vec3.fromValues (0, 0.15, 0.32);
        this.pipe1Transform = mat4.create();
        mat4.rotateX(this.pipe1Transform, this.pipe1Transform, Math.PI / 2);
        let moveSide = mat4.fromTranslation(mat4.create(), move);
        mat4.multiply(this.pipe1Transform, moveSide, this.pipe1Transform);

        this.pipe2Transform = mat4.create();
        mat4.fromTranslation(this.pipe2Transform, vec3.fromValues(0, 0.23, 0.36));

        // Windows
        let moveWindow = vec3.fromValues(0.13, -0.07, 0.28);
        this.windowTransform = mat4.create();
        mat4.rotateY(this.windowTransform, this.windowTransform, Math.PI/2);
        let moveUpWindow = mat4.fromTranslation(mat4.create(), moveWindow);
        mat4.multiply(this.windowTransform, moveUpWindow, this.windowTransform);

        let moveWindow2 = vec3.fromValues(0.13, 0.12, 0.15);
        this.window2Transform = mat4.create();
        mat4.rotateY(this.window2Transform, this.window2Transform, Math.PI/2);
        let moveUpWindow2 = mat4.fromTranslation(mat4.create(), moveWindow2);
        mat4.multiply(this.window2Transform, moveUpWindow2, this.window2Transform);

        // Door
        let moveDoor = vec3.fromValues(0.14, 0, 0.11);
        this.doorTransform = mat4.create();
        mat4.rotateY(this.doorTransform, this.doorTransform, Math.PI/2);
        let moveDoorUp = mat4.fromTranslation(mat4.create(), moveDoor);
        mat4.multiply(this.doorTransform, moveDoorUp, this.doorTransform);

        let moveDoor2 = vec3.fromValues(0.17, 0, 0.07);
        this.door2Transform = mat4.create();
        mat4.scale(this.door2Transform, this.door2Transform, vec3.fromValues(0.2, 1, 1));
        let moveDoorUp2 = mat4.fromTranslation(mat4.create(), moveDoor2);
        mat4.multiply(this.door2Transform, moveDoorUp2, this.door2Transform);

        //Repositioning C1 of Cones
        this.c1Transform = mat4.create();
        mat4.rotateY(this.c1Transform, this.c1Transform, Math.PI);
        let moveUp2 = vec3.fromValues(0, 0, 0.5);
        let moveUpC1 = mat4.fromTranslation(mat4.create(), moveUp2);
        mat4.multiply (this.c1Transform, moveUpC1, this.c1Transform);


        //C2
        this.c2Transform = mat4.create();
        mat4.rotateY(this.c2Transform, this.c2Transform, Math.PI);
        let moveUp3 = vec3.fromValues(0, 0, 0.6);
        let moveUpC2 = mat4.fromTranslation(mat4.create(), moveUp3);
        mat4.multiply (this.c2Transform, moveUpC2, this.c2Transform);


        //C3
        this.c3Transform = mat4.create();
        mat4.rotateY(this.c3Transform, this.c3Transform, Math.PI);
        let moveUp4 = vec3.fromValues(0, 0, 0.7);
        let moveUpC3 = mat4.fromTranslation(mat4.create(), moveUp4);
        mat4.multiply (this.c3Transform, moveUpC3, this.c3Transform);




        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.baseTransform);
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.topTransform);
        this.top.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.pipe1Transform);
        this.pipe1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.pipe2Transform);
        this.pipe2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.windowTransform);
        this.window1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.window2Transform);
        this.window2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.doorTransform);
        this.door.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.door2Transform);
        this.door2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.c1Transform);
        this.c1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.c2Transform);
        this.c2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.c3Transform);
        this.c3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);


    }
}