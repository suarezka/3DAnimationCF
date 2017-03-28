/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, sideViewMat, objCF;
var viewMatInverse, topViewMatInverse, normalMat
var pineappleCF, statueCF, rockCF, floorCF, lightCF, eyePos;
var axisBuff, tmpMat;
var globalAxes;
var currSelection = 0;
let houses = [];
let housesCF = [];
var timeStamp = 0;
var frames = 0;
var animation = true;

var speed = 30;

/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif, lightPosUnif2;
var objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos, lightPos2, useLightingUnif;

const IDENTITY = mat4.create();
var obj, lineBuff, normBuff, pointLight;
var shaderProg, redrawNeeded, showNormal, showLightVectors;
var lightingComponentEnabled = [true, true, true];
var lightingComponentEnabled2 = [true, true, true];

var coneSpinAngle;
var floor;


function main() {

    /* GET BUTTON VALUES */
    let light1CheckBox = document.getElementById("showlight1");
    light1CheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[1] = ev.target.checked;
        lightingComponentEnabled[2] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);

    let light2CheckBox = document.getElementById("showlight2");
    light2CheckBox.addEventListener('change', ev => {
        lightingComponentEnabled2[0] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled2);
        redrawNeeded = true;
    }, false);

    let ambientCheckBox = document.getElementById("enableAmbient");
    ambientCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[0] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let diffuseCheckBox = document.getElementById("enableDiffuse");
    diffuseCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[1] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let specularCheckBox = document.getElementById("enableSpecular");
    specularCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[2] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let ambCoeffSlider = document.getElementById("amb-coeff");
    ambCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(ambCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    ambCoeffSlider.value = 1;
    let diffCoeffSlider = document.getElementById("diff-coeff");
    diffCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(diffCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    diffCoeffSlider.value = 0.75;  // random in [0.5, 1.0]
    let specCoeffSlider = document.getElementById("spec-coeff");
    specCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(specCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    specCoeffSlider.value = 0.8;
    let shinySlider = document.getElementById("spec-shiny");
    shinySlider.addEventListener('input', ev => {
        gl.uniform1f(shininessUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    shinySlider.value = 45;

    // let redSlider = document.getElementById("redslider");
    // let greenSlider = document.getElementById("greenslider");
    // let blueSlider = document.getElementById("blueslider");
    // redSlider.addEventListener('input', colorChanged, false);
    // greenSlider.addEventListener('input', colorChanged, false);
    // blueSlider.addEventListener('input', colorChanged, false);

    let objxslider = document.getElementById("objx");
    let objyslider = document.getElementById("objy");
    let objzslider = document.getElementById("objz");
    objxslider.addEventListener('input', objPosChanged, false);
    objyslider.addEventListener('input', objPosChanged, false);
    objzslider.addEventListener('input', objPosChanged, false);

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    let eyexslider = document.getElementById("eyex");
    let eyeyslider = document.getElementById("eyey");
    let eyezslider = document.getElementById("eyez");
    eyexslider.addEventListener('input', eyePosChanged, false);
    eyeyslider.addEventListener('input', eyePosChanged, false);
    eyezslider.addEventListener('input', eyePosChanged, false);


    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    window.addEventListener("keypress", keyboardHandler, false);
    let menu = document.getElementById("menu");
    menu.addEventListener("change", menuSelected);

    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then(prog => {
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor(0, 163/255, 230/255, 1);
            gl.enable(gl.DEPTH_TEST);
            axisBuff = gl.createBuffer();
            lineBuff = gl.createBuffer();
            normBuff = gl.createBuffer();
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            normalAttr = gl.getAttribLocation(prog, "vertexNormal");
            lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
            lightPosUnif2 = gl.getUniformLocation(prog, "lightPosWorld2");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            normalUnif = gl.getUniformLocation(prog, "normalMat");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            objTintUnif = gl.getUniformLocation(prog, "objectTint");
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
            gl.enableVertexAttribArray(posAttr);
            // gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            viewMatInverse = mat4.create();
            topViewMat = mat4.create();
            topViewMatInverse = mat4.create();
            sideViewMat = mat4.create();
            ringCF = mat4.create();
            pineappleCF = mat4.create();
            statueCF = mat4.create();
            rockCF = mat4.create();
            floorCF = mat4.create();
            normalMat = mat3.create();
            lightCF = mat4.create();
            tmpMat = mat4.create();
            eyePos = vec3.fromValues(3, 2, 3);
            objCF = mat4.create();

            mat4.lookAt(viewMat,
                eyePos,
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            mat4.invert (viewMatInverse, viewMat);
            mat4.lookAt(topViewMat,
                vec3.fromValues(0,0,2),
                vec3.fromValues(0,0,0),
                vec3.fromValues(0,1,0)
            );


            gl.uniformMatrix4fv(modelUnif, false, pineappleCF);
            gl.uniformMatrix4fv(modelUnif, false, statueCF);
            gl.uniformMatrix4fv(modelUnif, false, rockCF);
            gl.uniformMatrix4fv(modelUnif, false, ringCF);

            lightPos = vec3.fromValues(1, 1, 2);
            eyexslider.value = lightPos[0];
            eyeyslider.value = lightPos[1];
            eyezslider.value = lightPos[2];
            mat4.fromTranslation(lightCF, lightPos);
            lightx.value = lightPos[0];
            lighty.value = lightPos[1];
            lightz.value = lightPos[2];
            gl.uniform3fv (lightPosUnif, lightPos);
            let vertices = [0, 0, 0, 1, 1, 1,
                lightPos[0], 0, 0, 1, 1, 1,
                lightPos[0], lightPos[1], 0, 1, 1, 1,
                lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

            lightPos2 = vec3.fromValues(0, 0, 2);
            gl.uniform3fv (lightPosUnif2, lightPos2);

            gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
            gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
            gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
            gl.uniform1f(shininessUnif, shinySlider.value);

            gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
            pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);

            //FIRST HOUSE
            houses.push(new Pineapple(gl));
            const trans1 = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 1.5, 0));
            mat4.multiply(pineappleCF, trans1, pineappleCF);
            housesCF.push(pineappleCF);

            //SECOND HOUSE
            houses.push(new SquidwardHouse(gl));
            housesCF.push(statueCF);

            //THIRD HOME
            houses.push(new PatrickHouse(gl));
            const trans2 = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, -1.5, 0));
            mat4.multiply(rockCF, trans2, rockCF);
            housesCF.push(rockCF);

            floor = new Floor(gl);
            globalAxes = new Axes(gl);
            coneSpinAngle = 10;
            redrawNeeded = true;
            resizeHandler();
            render();
        });
}

function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.9 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
        let ratio = 2 * glCanvas.height / glCanvas.width;
        console.log("Landscape mode, ratio is " + ratio);
        mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
        mat4.perspective(persProjMat,
            Math.PI / 3, /* 60 degrees vertical field of view */
            1 / ratio, /* must be width/height ratio */
            1, /* near plane at Z=1 */
            20);
        /* far plane at Z=20 */
    } else {
        alert("Window is too narrow!");
    }

}

function keyboardHandler(event) {
    const rotateZccw = mat4.fromZRotation(mat4.create(), coneSpinAngle * Math.PI/180.0);
    const rotateZcw = mat4.fromZRotation(mat4.create(), - (coneSpinAngle * Math.PI/180.0));
    const rotateXccw = mat4.fromXRotation(mat4.create(), coneSpinAngle * Math.PI/180.0);
    const rotateXcw = mat4.fromXRotation(mat4.create(), - (coneSpinAngle * Math.PI/180.0));
    const rotateYccw = mat4.fromYRotation(mat4.create(), coneSpinAngle * Math.PI/180.0);
    const rotateYcw = mat4.fromYRotation(mat4.create(), - (coneSpinAngle * Math.PI/180.0));

    switch (event.key) {
        case "x":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateXccw);
            break;
        case "X":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateXcw);
            break;
        case "y":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateYcw);
            break;
        case "Y":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateYccw);
            break;
        case "z":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateZccw);
            break;
        case "Z":
            mat4.multiply(housesCF[currSelection], housesCF[currSelection], rotateZcw);
            break;
        case "+":
            mat4.scale(housesCF[currSelection], housesCF[currSelection], vec3.fromValues(1.05, 1.05, 1.05));
            break;
        case "-":
            mat4.scale(housesCF[currSelection], housesCF[currSelection], vec3.fromValues(0.75, 0.75, 0.75));
            break;
        case "p":
            if (animation)
                animation = false;
            else if (!animation)
                animation = true;
            break;
        case "s":
            speed -= 10;
            break;
        case "S":
            speed += 10;
            break;
    }
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    drawTopView();
    if (animation) {
        let now = Date.now();
        let elapse = (now - timeStamp) / 1000;
        /* convert to second */
        timeStamp = now;
        let ringSpinAngle = elapse * (speed / 60) * Math.PI * 2;
        const trans3 = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0.05));
        const trans4 = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -0.05));

        if(currSelection == 0) {
            if (frames == 12){
                mat4.multiply(pineappleCF, trans3, pineappleCF);
            }
            if (frames == 25) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(1.05, 1.05, 1.05));
                mat4.multiply(pineappleCF, trans3, pineappleCF);
            }
            if (frames == 37){
                mat4.multiply(pineappleCF, trans4, pineappleCF);
            }

            if (frames == 50) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(.95, .95, .95));
                mat4.multiply(pineappleCF, trans4, pineappleCF);
                frames = 0;
            }
            mat4.rotateZ(housesCF[0], housesCF[0], ringSpinAngle);
        }

        if(currSelection == 1) {
            if (frames == 12){
                mat4.multiply(statueCF, trans3, statueCF);
            }
            if (frames == 25) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(1.05, 1.05, 1.05));
                mat4.multiply(statueCF, trans3, statueCF);
            }
            if (frames == 37){
                mat4.multiply(statueCF, trans4, statueCF);
            }

            if (frames == 50) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(.95, .95, .95));
                mat4.multiply(statueCF, trans4, statueCF);
                frames = 0;
            }
            mat4.rotateZ(housesCF[1], housesCF[1], ringSpinAngle);
        }

        if(currSelection == 2){
            if (frames == 12){
                mat4.multiply(rockCF, trans3, rockCF);
            }
            if (frames == 25) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(1.05, 1.05, 1.05));
                mat4.multiply(rockCF, trans3, rockCF);
            }
            if (frames == 37){
                mat4.multiply(rockCF, trans4, rockCF);
            }

            if (frames == 50) {
                //mat4.scale(housesCF[2], housesCF[2], vec3.fromValues(.95, .95, .95));
                mat4.multiply(rockCF, trans4, rockCF);
                frames = 0;
            }
            mat4.rotateZ(housesCF[2], housesCF[2], ringSpinAngle);
        }

        frames++;
    }

    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i (useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    /* draw the global coordinate frame */
    //globalAxes.draw(posAttr, normalAttr, modelUnif, IDENTITY);

    /* Draw the light source (a sphere) using its own coordinate frame */
    pointLight.draw(posAttr, colAttr, modelUnif, lightCF);

    if (typeof floor !== 'undefined') {
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        gl.uniform3fv(objTintUnif, vec3.fromValues((65/256), (168/256), (47/256)));
        floor.draw(posAttr, normalAttr, modelUnif, floorCF);
    }
    //floor.draw(posAttr, colAttr, modelUnif, floorCF);

    if (typeof houses[0] !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        //mat4.multiply(tmpMat, pineappleCF, objCF);   // tmp = ringCF * tmpMat
        houses[0].draw(posAttr, normalAttr, modelUnif, pineappleCF);
    }

    if (typeof houses[1] !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        //mat4.multiply(tmpMat, statueCF, objCF);   // tmp = ringCF * tmpMat
        houses[1].draw(posAttr, normalAttr, modelUnif, statueCF);
    }

    if (typeof houses[2] !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        //mat4.multiply(tmpMat, rockCF, objCF);   // tmp = ringCF * tmpMat
        houses[2].draw(posAttr, normalAttr, modelUnif, rockCF);
    }

    // mat4.multiply(tmpMat, rockCF, objCF);   // tmp = ringCF * tmpMat
    // obj3.draw(posAttr, colAttr, modelUnif, tmpMat);
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    gl.viewport(0, 0, glCanvas.width / 2, glCanvas.height);
    mat4.mul (tmpMat, viewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width/2, glCanvas.height);
    drawScene();

    if (typeof houses[0] !== 'undefined') {
        gl.uniform1i(useLightingUnif, false);
        gl.disableVertexAttribArray(normalAttr);
        gl.enableVertexAttribArray(colAttr);
        if (showNormal)
            houses[0].drawNormal(posAttr, colAttr, modelUnif, pineappleCF);
        if (showLightVectors)
            houses[0].drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, pineappleCF);
    }

    if (typeof houses[1] !== 'undefined') {
        gl.uniform1i(useLightingUnif, false);
        gl.disableVertexAttribArray(normalAttr);
        gl.enableVertexAttribArray(colAttr);
        if (showNormal)
            houses[1].drawNormal(posAttr, colAttr, modelUnif, statueCF);
        if (showLightVectors)
            houses[1].drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, statueCF);
    }

    if (typeof houses[2] !== 'undefined') {
        gl.uniform1i(useLightingUnif, false);
        gl.disableVertexAttribArray(normalAttr);
        gl.enableVertexAttribArray(colAttr);
        if (showNormal)
            houses[2].drawNormal(posAttr, colAttr, modelUnif, rockCF);
        if (showLightVectors)
            houses[2].drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, rockCF);
    }
}

function ambColorChanged(ev) {
    switch (ev.target.id) {
        case 'r-amb-slider':
            objAmbient[0] = ev.target.value;
            break;
        case 'g-amb-slider':
            objAmbient[1] = ev.target.value;
            break;
        case 'b-amb-slider':
            objAmbient[2] = ev.target.value;
            break;
    }
    gl.uniform3fv(objAmbientUnif, objAmbient);
    redrawNeeded = true;
}

// function colorChanged(ev) {
//     switch (ev.target.id) {
//         case 'redslider':
//             objTint[0] = ev.target.value;
//             break;
//         case 'greenslider':
//             objTint[1] = ev.target.value;
//             break;
//         case 'blueslider':
//             objTint[2] = ev.target.value;
//             break;
//     }
//     gl.uniform3fv(objTintUnif, objTint);
//     redrawNeeded = true;
// }

function lightPosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx':
            lightPos[0] = ev.target.value;
            break;
        case 'lighty':
            lightPos[1] = ev.target.value;
            break;
        case 'lightz':
            lightPos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv (lightPosUnif, lightPos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        lightPos[0], 0, 0, 1, 1, 1,
        lightPos[0], lightPos[1], 0, 1, 1, 1,
        lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}


function objPosChanged(ev) {

    switch (ev.target.id) {
        case 'objx':
            housesCF[currSelection][12] = ev.target.value;
            break;
        case 'objy':
            housesCF[currSelection][13] = ev.target.value;
            break;
        case 'objz':
            housesCF[currSelection][14] = ev.target.value;
            break;
    }
    redrawNeeded = true;
}

function eyePosChanged(ev) {
    switch (ev.target.id) {
        case 'eyex':
            eyePos[0] = ev.target.value;
            break;
        case 'eyey':
            eyePos[1] = ev.target.value;
            break;
        case 'eyez':
            eyePos[2] = ev.target.value;
            break;
    }
    mat4.lookAt(viewMat,
        eyePos,
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;
}

function drawTopView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, topViewMat);
    gl.viewport(glCanvas.width / 2, 0, glCanvas.width / 2, glCanvas.height);
    drawScene();
}

function drawSideView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, sideViewMat);
    gl.viewport(glCanvas.width / 2, 0, glCanvas.width / 2, glCanvas.height);
    mat4.mul (tmpMat, topViewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(glCanvas.width/2, 0, glCanvas.width/2, glCanvas.height);
    drawScene();
}

function menuSelected(ev) {
    let sel = ev.currentTarget.selectedIndex;
    // paramGroup[currSelection].hidden = true;
    // paramGroup[sel].hidden = false;
    currSelection = sel;
    console.log("New selection is ", currSelection);
}
