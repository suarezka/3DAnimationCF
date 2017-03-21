/**
 * Created by Nate Benson on 3/13/2017.
 */

class Floor {
    constructor (gl) {
        let baseColor = vec3.fromValues(156.0/255, 180.0/255, 158.0/255);
        let baseColor2 = vec3.fromValues(60.0/255, 60.0/255, 60.0/255);

        this.base = new Cube(gl, 1, 4, baseColor, baseColor, baseColor);
        this.road = new Cube(gl, 1, 4, baseColor2, baseColor2, baseColor2);
        this.path = new Cube(gl, 1, 4, baseColor2, baseColor2, baseColor2);
        this.path2 = new Cube(gl, 1, 4, baseColor2, baseColor2, baseColor2);
        this.path3 = new Cube(gl, 1, 4, baseColor2, baseColor2, baseColor2);

        // Base
        let move = vec3.fromValues(0, 0, 0);
        this.baseTransform = mat4.create();
        mat4.scale(this.baseTransform, this.baseTransform, vec3.fromValues(10, 10, 0.01));
        let moveUp = mat4.fromTranslation(mat4.create(), move);
        mat4.multiply(this.baseTransform, moveUp, this.baseTransform);

        // Road
        let moveRoad = vec3.fromValues(1.5, 0, 0.01);
        this.roadTransform = mat4.create();
        mat4.scale(this.roadTransform, this.roadTransform, vec3.fromValues(0.7, 10, 0.01));
        let moveUpRoad = mat4.fromTranslation(mat4.create(), moveRoad);
        mat4.multiply(this.roadTransform, moveUpRoad, this.roadTransform);

        let movePath = vec3.fromValues(0.75, 0, 0.01);
        this.pathTransform = mat4.create();
        mat4.scale(this.pathTransform, this.pathTransform, vec3.fromValues(0.9, 0.1, 0.01));
        let moveUpPath = mat4.fromTranslation(mat4.create(), movePath);
        mat4.multiply(this.pathTransform, moveUpPath, this.pathTransform);

        let movePath2 = vec3.fromValues(0.7, 2, 0.01);
        this.pathTransform2 = mat4.create();
        mat4.scale(this.pathTransform2, this.pathTransform2, vec3.fromValues(1, 0.1, 0.01));
        let moveUpPath2 = mat4.fromTranslation(mat4.create(), movePath2);
        mat4.multiply(this.pathTransform2, moveUpPath2, this.pathTransform2);

        let movePath3 = vec3.fromValues(0.7, 1, 0.01);
        this.pathTransform3 = mat4.create();
        mat4.scale(this.pathTransform3, this.pathTransform3, vec3.fromValues(1, 0.1, 0.01));
        let moveUpPath3 = mat4.fromTranslation(mat4.create(), movePath3);
        mat4.multiply(this.pathTransform3, moveUpPath3, this.pathTransform3);

        this.tmp = mat4.create();
    }
    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.baseTransform);
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.roadTransform);
        this.road.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.pathTransform);
        this.path.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.pathTransform2);
        this.path2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.pathTransform3);
        this.path3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}