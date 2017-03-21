/**
 * Created by Nate Benson on 3/13/2017.
 */
class SquidwardHouse {
    constructor (gl) {
        // Shades of Blueish
        let baseColor = vec3.fromValues(23.0/255, 70.0/255, 144.0/255);
        let baseColor2 = vec3.fromValues(43.0/255, 98.0/255, 165.0/255);

        // Shades of Blueish - Accent
        let baseColor3 = vec3.fromValues(45.0/255, 100.0/255, 170.0/255);
        let baseColor4 = vec3.fromValues(49.0/255, 106.0/255, 180.0/255);

        // Pipe Color
        //let pipeColor = vec3.fromValues(0.117647, 0.564706, 1);
        let windowColor = vec3.fromValues(0.529412, 0.807843, 0.980392);
        let windowColor2 = vec3.fromValues(0.429412, 0.707843, 0.940392);

        // Door Color
        let doorColor = vec3.fromValues(150.0/255, 109.0/255, 52.0/255);

        this.base = new Cylinder(gl, 0.15, 0.25, 0.8, 16, baseColor, baseColor2);
        this.nose = new Cube(gl, 0.1, 4, baseColor3, baseColor4, baseColor3);
        this.ears = new Cube(gl, 0.1, 4, baseColor3, baseColor4, baseColor3);
        this.brow = new Cube(gl, 0.1, 4, baseColor3, baseColor4, baseColor3);
        this.window1 = new Ring(gl, 0.05, 0.025, 0.1, 10, 4, windowColor, windowColor2);
        this.window2 = new Ring(gl, 0.05, 0.025, 0.1, 10, 4, windowColor, windowColor2);
        this.door = new Cylinder(gl, 0.06, 0.06, 0.1, 10, doorColor, doorColor);
        this.door2 = new Cube(gl, 0.12, 4, doorColor, doorColor, doorColor);

        // Base
        let moveUp = vec3.fromValues(0, 0, 0.4);
        this.baseTransform = mat4.create();
        let moveBase = mat4.fromTranslation(mat4.create(), moveUp);
        //crownTransform = moveUpCrown * crownTransform
        mat4.multiply (this.baseTransform, moveBase, this.baseTransform);

        // Nose
        let move = vec3.fromValues(0.2, 0, 0.4);
        this.noseTransform = mat4.create();
        mat4.rotateY(this.noseTransform, this.noseTransform, -Math.PI/10);
        mat4.scale(this.noseTransform, this.noseTransform, vec3.fromValues(1, 1, 3));
        let moveUpNose = mat4.fromTranslation(mat4.create(), move);
        mat4.multiply(this.noseTransform, moveUpNose, this.noseTransform);

        // Ears
        this.earsTransform = mat4.create();
        mat4.scale(this.earsTransform, this.earsTransform, vec3.fromValues(1, 5, 3));
        let moveUpEars = mat4.fromTranslation(mat4.create(), moveUp);
        mat4.multiply(this.earsTransform, moveUpEars, this.earsTransform);

        // Brow
        let moveBrow = vec3.fromValues(0.1, 0, 0.59);
        this.browTransform = mat4.create();
        mat4.scale(this.browTransform, this.browTransform, vec3.fromValues(2, 3.2, .7));
        let moveUpBrow = mat4.fromTranslation(mat4.create(), moveBrow);
        mat4.multiply(this.browTransform, moveUpBrow, this.browTransform);

        // Windows
        let moveWindow = vec3.fromValues(0.13, 0.1, 0.5);
        this.windowTransform = mat4.create();
        mat4.rotateY(this.windowTransform, this.windowTransform, Math.PI/2);
        let moveUpWindow = mat4.fromTranslation(mat4.create(), moveWindow);
        mat4.multiply(this.windowTransform, moveUpWindow, this.windowTransform);

        let moveWindow2 = vec3.fromValues(0.13, -0.1, 0.5);
        this.window2Transform = mat4.create();
        mat4.rotateY(this.window2Transform, this.window2Transform, Math.PI/2);
        let moveUpWindow2 = mat4.fromTranslation(mat4.create(), moveWindow2);
        mat4.multiply(this.window2Transform, moveUpWindow2, this.window2Transform);

        // Door
        let moveDoor = vec3.fromValues(0.2, 0, 0.14);
        this.doorTransform = mat4.create();
        mat4.rotateY(this.doorTransform, this.doorTransform, Math.PI/2);
        let moveDoorUp = mat4.fromTranslation(mat4.create(), moveDoor);
        mat4.multiply(this.doorTransform, moveDoorUp, this.doorTransform);

        let moveDoor2 = vec3.fromValues(0.19, 0, 0.07);
        this.door2Transform = mat4.create();
        mat4.scale(this.door2Transform, this.door2Transform, vec3.fromValues(1, 1, 1.2));
        let moveDoorUp2 = mat4.fromTranslation(mat4.create(), moveDoor2);
        mat4.multiply(this.door2Transform, moveDoorUp2, this.door2Transform);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.baseTransform);
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.noseTransform);
        this.nose.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.earsTransform);
        this.ears.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.windowTransform);
        this.window1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.window2Transform);
        this.window2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.browTransform);
        this.brow.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.doorTransform);
        this.door.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.door2Transform);
        this.door2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}