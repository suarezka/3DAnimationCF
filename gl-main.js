/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, sideViewMat, ringCF;
var pineappleCF, statueCF, rockCF, floorCF;
var axisBuff, tmpMat;
var globalAxes;
var currSelection = 0;
var currObjName;

/* Vertex shader attribute variables */
var posAttr, colAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif;

const IDENTITY = mat4.create();
var coneSpinAngle;
var obj, obj2, obj3, floor;
var shaderProg;

function main() {
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
            /* enable hidden surface removal */
            //gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            //gl.cullFace(gl.BACK);
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            topViewMat = mat4.create();
            sideViewMat = mat4.create();
            ringCF = mat4.create();
            pineappleCF = mat4.create();
            statueCF = mat4.create();
            rockCF = mat4.create();
            floorCF = mat4.create();
            tmpMat = mat4.create();
            mat4.lookAt(viewMat,
                vec3.fromValues(2, 2, 2), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1));
            /* up */
            mat4.lookAt(topViewMat,
                vec3.fromValues(0, 0, 2),
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(0, 1, 0));
            mat4.lookAt(sideViewMat,
                vec3.fromValues(2, 0, 0),
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(0, 0, 1));

            gl.uniformMatrix4fv(modelUnif, false, pineappleCF);
            gl.uniformMatrix4fv(modelUnif, false, statueCF);
            gl.uniformMatrix4fv(modelUnif, false, rockCF);
            gl.uniformMatrix4fv(modelUnif, false, ringCF);

            obj = new Pineapple(gl);
            obj2 = new SquidwardHouse(gl);
            obj3 = new PatrickHouse(gl);
            floor = new Floor(gl);
            globalAxes = new Axes(gl);


           // mat4.rotateX(pineappleCF, pineappleCF, Math.PI);
            mat4.rotateX(ringCF, ringCF, -Math.PI / 2);
            coneSpinAngle = 10;
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
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(1, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-1, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 1, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, -1, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 1));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -1));

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
            mat4.multiply(objCF, transXneg, objCF);  // ringCF = Trans * ringCF
            break;
        case "X":
            mat4.multiply(objCF, transXpos, objCF);  // ringCF = Trans * ringCF
            break;
        case "y":
            mat4.multiply(objCF, transYneg, objCF);  // ringCF = Trans * ringCF
            break;
        case "Y":
            mat4.multiply(objCF, transYpos, objCF);  // ringCF = Trans * ringCF
            break;
        case "z":
            mat4.multiply(objCF, transZneg, objCF);  // ringCF = Trans * ringCF
            break;
        case "Z":
            mat4.multiply(objCF, transZpos, objCF);  // ringCF = Trans * ringCF
            break;
        case "l":
            mat4.multiply(objCF, objCF, rotateXccw);
            break;
        case "r":
            mat4.multiply(objCF, objCF, rotateXcw);
            break;
        case "u":
            mat4.multiply(objCF, objCF, rotateYcw);
            break;
        case "d":
            mat4.multiply(objCF, objCF, rotateYccw);
            break;
        case "c":
            mat4.multiply(objCF, objCF, rotateZccw);
            break;
        case "C":
            mat4.multiply(objCF, objCF, rotateZcw);
            break;
        case "+":
            mat4.scale(objCF, objCF, vec3.fromValues(1.05, 1.05, 1.05));
            break;
        case "-":
            mat4.scale(objCF, objCF, vec3.fromValues(0.75, 0.75, 0.75));
            break;
    }
    textOut.innerHTML = currObjName + " origin (" + objCF[12].toFixed(1) + ", "
        + objCF[13].toFixed(1) + ", "
        + objCF[14].toFixed(1) + ")";
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
    let rowNum = document.getElementById("house-row").valueAsNumber;
    let num = document.getElementById("house-number").valueAsNumber;

    floor.draw(posAttr, colAttr, modelUnif, floorCF);

    //Draw Multiple Pineapple Houses
    if (typeof obj !== 'undefined') {
        var xPos;
        var yPos;
        var x = 0.5;
        for (let j = 0; j < rowNum; j++) {
            let row = j * x;
            xPos = 0;
            yPos = 1.5 + row;

            for (let k = 0; k < num; k++) {
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, 0));
                mat4.multiply(tmpMat, pineappleCF, tmpMat);   // tmp = ringCF * tmpMat
                obj.draw(posAttr, colAttr, modelUnif, tmpMat);
                xPos -= 0.5;
                yPos -= 0.5;
            }
        }
    }

    //Draw Multiple Squidward Houses
    if (typeof obj2 !== 'undefined') {
        var xPos;
        var yPos;
        var x = 0.5;
        for (let j = 0; j < rowNum; j++) {
            let row = j * x;
            xPos = 0;
            yPos = 0 + row;

            for (let k = 0; k < num; k++) {
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, 0));
                mat4.multiply(tmpMat, statueCF, tmpMat);   // tmp = ringCF * tmpMat
                obj2.draw(posAttr, colAttr, modelUnif, tmpMat);
                xPos -= 0.5;
                yPos -= 0.5;
            }
        }
    }

    //Draw Multiple Patrick Houses
    if (typeof obj3 !== 'undefined') {
        var xPos;
        var yPos;
        var x = 0.5;
        for (let j = 0; j < rowNum; j++) {
            let row = j * x;
            xPos = 0;
            yPos = -1.5 + row;

            for (let k = 0; k < num; k++) {
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, 0));
                mat4.multiply(tmpMat, rockCF, tmpMat);   // tmp = ringCF * tmpMat
                obj3.draw(posAttr, colAttr, modelUnif, tmpMat);
                xPos -= 0.5;
                yPos -= 0.5;
            }
        }
    }
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
