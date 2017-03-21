/**
 * Created by Nate Benson on 3/13/2017.
 */

class PatrickHouse {
    constructor (gl) {
        let baseColor = vec3.fromValues(30.0/255, 30.0/255, 30.0/255);

        this.base = new Sphere(gl, 0.3, 20, 10, baseColor, baseColor);

        // Base
        //this.baseTransform = mat4.create();
        //let moveBase = mat4.fromTranslation()
    }
    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        this.base.draw(vertexAttr, colorAttr, modelUniform, coordFrame);
    }
}