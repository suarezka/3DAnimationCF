/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat;
var viewMatInverse, topViewMatInverse, normalMat;
var pineappleCF, statueCF, rockCF, floorCF, lightCF, eyePos;
var axisBuff, tmpMat;
var globalAxes;
var currObjName;
var currSelection = 0;
let houses = [];
let housesCF = [];
var objCF;

/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif;
var objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos, useLightingUnif;

const IDENTITY = mat4.create();
var obj, obj2, obj3, floor;
var lineBuff, normBuff, objTint, pointLight;
var shaderProg, redrawNeeded, showNormal, showLightVectors;
var lightingComponentEnabled = [true, true, true];
var coneSpinAngle;

function main() {
    /* GET BUTTON VALUES */

    let normalCheckBox = document.getElementById("shownormal");
    normalCheckBox.addEventListener('change', ev => {
        showNormal = ev.target.checked;
        redrawNeeded = true;
    }, false);
    let lightCheckBox = document.getElementById("showlightvector");
    lightCheckBox.addEventListener('change', ev => {
        showLightVectors = ev.target.checked;
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
    ambCoeffSlider.value = Math.random() * 0.2;
    let diffCoeffSlider = document.getElementById("diff-coeff");
    diffCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(diffCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    diffCoeffSlider.value = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
    let specCoeffSlider = document.getElementById("spec-coeff");
    specCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(specCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    specCoeffSlider.value = Math.random();
    let shinySlider = document.getElementById("spec-shiny");
    shinySlider.addEventListener('input', ev => {
        gl.uniform1f(shininessUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    shinySlider.value = Math.floor(1 + Math.random() * shinySlider.max);

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
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            viewMatInverse = mat4.create();
            topViewMat = mat4.create();
            topViewMatInverse = mat4.create();
            pineappleCF = mat4.create();
            statueCF = mat4.create();
            rockCF = mat4.create();
            floorCF = mat4.create();
            normalMat = mat3.create();
            lightCF = mat4.create();
            tmpMat = mat4.create();
            eyePos = vec3.fromValues(3, 2, 3);
            mat4.lookAt(viewMat,
                eyePos,
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1));
            /* up */
            mat4.lookAt(topViewMat,
                vec3.fromValues(0, 0, 2),
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(0, 1, 0)
            );
            mat4.invert (topViewMatInverse, topViewMat);
            gl.uniformMatrix4fv(modelUnif, false, IDENTITY);

            lightPos = vec3.fromValues(0, 2, 2);
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

            gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
            gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
            gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
            gl.uniform1f(shininessUnif, shinySlider.value);
            gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);

            gl.uniformMatrix4fv(modelUnif, false, pineappleCF);
            gl.uniformMatrix4fv(modelUnif, false, statueCF);
            gl.uniformMatrix4fv(modelUnif, false, rockCF);

            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
            pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);

            // obj = new Pineapple(gl);
            // obj2 = new SquidwardHouse(gl);
            // obj3 = new PatrickHouse(gl);
            floor = new Floor(gl);
            globalAxes = new Axes(gl);

            houses.push(new Pineapple(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(0, 1.5, 0));
            housesCF.push(mat4.clone(tmpMat));

            houses.push(new SquidwardHouse(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(0, 0, 0));
            housesCF.push(mat4.clone(tmpMat));

            houses.push(new PatrickHouse(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(0, -1.5, 0));
            housesCF.push(mat4.clone(tmpMat));


            // mat4.rotateX(pineappleCF, pineappleCF, Math.PI);
            //mat4.rotateX(ringCF, ringCF, -Math.PI / 2);
            //coneSpinAngle = 10;
            resizeHandler();
            render();
        });
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
    //mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;
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

    let objCF = mat4.create();

    switch (currSelection) {
        case 0:
            currObjName = document.getElementById("house0").innerText;
            objCF = pineappleCF;
            break;
        case 1:
            currObjName = document.getElementById("house1").innerText;
            objCF = statueCF;
            break;
        case 2:
            currObjName = document.getElementById("house2").innerText;
            objCF = rockCF;
            break;
    }

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
    }
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    drawTopView();
    /* looking at the XY plane, Z-axis points towards the viewer */
    //coneSpinAngle += 1;  /* add 1 degree */
    requestAnimationFrame(render);
}

function drawScene() {
    floor.draw(posAttr, colAttr, modelUnif, floorCF);

    for (let k = 0; k < houses.length; k++) {
        mat4.mul(tmpMat, housesCF[k], tmpMat);
        //gl.uniform1i(useLightingUnif, false);
        //gl.disableVertexAttribArray(colAttr);
        //gl.enableVertexAttribArray(normalAttr);

        tmpMat = mat4.clone(housesCF[k]);
        houses[k].draw(posAttr, colAttr, modelUnif, tmpMat);
    }
    //Draw Multiple Pineapple Houses
    // if (typeof houses[0] !== 'undefined') {
    //     mat4.fromTranslation(tmpMat, vec3.fromValues(0, 1.5, 0));
    //     mat4.multiply(tmpMat, pineappleCF, tmpMat);   // tmp = ringCF * tmpMat
    //     houses[0].draw(posAttr, colAttr, modelUnif, tmpMat);
    // }
    //
    // //Draw Multiple Statue Houses
    // if (typeof houses[1] !== 'undefined') {
    //     mat4.fromTranslation(tmpMat, vec3.fromValues(0, 0, 0));
    //     mat4.multiply(tmpMat, statueCF, tmpMat);   // tmp = ringCF * tmpMat
    //     houses[1].draw(posAttr, colAttr, modelUnif, tmpMat);
    // }
    //
    // //Draw Multiple Rock Houses
    // if (typeof houses[2] !== 'undefined') {
    //     mat4.fromTranslation(tmpMat, vec3.fromValues(0, -1.5, 0));
    //     mat4.multiply(tmpMat, rockCF, tmpMat);   // tmp = ringCF * tmpMat
    //     houses[2].draw(posAttr, colAttr, modelUnif, tmpMat);
    // }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    gl.viewport(0, 0, glCanvas.width / 2, glCanvas.height);
    drawScene();
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
    drawScene();
}

function menuSelected(ev) {
    let sel = ev.currentTarget.selectedIndex;
    // paramGroup[currSelection].hidden = true;
    // paramGroup[sel].hidden = false;
    currSelection = sel;
    console.log("New selection is ", currSelection);
}
