let indexBuffer, indices;
//points on texture
let TexCoords =
    [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Right face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Top face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Bottom face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];


let Shaders = null;
let GL = null;

let VertexShaderSource =
    `
    attribute vec3 aVertex;
    attribute vec4 aColor;
    attribute vec2 aTexCoord;

    uniform mat4 uModelView;
    uniform mat4 uProjection;

    varying vec4 vColor;
    varying vec2 vTexCoord;

    void main ()
    {
        vColor = aColor;
        vTexCoord = aTexCoord;
        gl_Position = uProjection * uModelView * vec4 (aVertex, 1.0);
    }
`




let FragmentShaderSource =
    `
    precision mediump float;
    varying vec4 vColor;
    varying vec2 vTexCoord;
    uniform sampler2D uSampler;
    uniform int uEnableTexture;

    void main()
    {
        if (uEnableTexture == 0) {
            gl_FragColor = vColor;
        }
        else {
            gl_FragColor = texture2D(uSampler, vTexCoord);
        }
    }
`




window.onload = function () {

    let canvas = document.getElementById("myCanvas")
    GL = canvas.getContext("webgl")


    //Setup Shader START
    let vertexShader = GL.createShader(GL.VERTEX_SHADER)
    GL.shaderSource(vertexShader, VertexShaderSource)
    GL.compileShader(vertexShader)

    // Check for any compilation error
    if (!GL.getShaderParameter(vertexShader, GL.COMPILE_STATUS)) {
        alert(GL.getShaderInfoLog(vertexShader));
        return null;
    }

    let fragmentShader = GL.createShader(GL.FRAGMENT_SHADER)
    GL.shaderSource(fragmentShader, FragmentShaderSource)
    GL.compileShader(fragmentShader)

    // Check for any compilation error
    if (!GL.getShaderParameter(fragmentShader, GL.COMPILE_STATUS)) {
        alert(GL.getShaderInfoLog(fragmentShader));
        return null;
    }

    Shaders = GL.createProgram()
    GL.attachShader(Shaders, vertexShader)
    GL.attachShader(Shaders, fragmentShader)
    GL.linkProgram(Shaders)
    GL.useProgram(Shaders)
    //setup Shader END

    //Set references to fragment and vertex shader variables
    Shaders.aVertexLoc = GL.getAttribLocation(Shaders, "aVertex")
    Shaders.aColorLoc = GL.getAttribLocation(Shaders, "aColor")
    Shaders.uModelViewLoc = GL.getUniformLocation(Shaders, "uModelView")
    Shaders.uProjectionLoc = GL.getUniformLocation(Shaders, "uProjection")
    Shaders.aTextureId = GL.getAttribLocation(Shaders, 'aTexCoord');
    Shaders.uSamplerID = GL.getUniformLocation(Shaders, "uSampler");
    Shaders.uEnableTextureID = GL.getUniformLocation(Shaders, "uEnableTexture");

    // Load texture here
    let image = new Image();
    let texObj;
    image.onload = function () {
        texObj = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, texObj);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, texObj);
        GL.uniform1i(Shaders.uSamplerID, 0);

        requestAnimationFrame(render);
    }
    image.src = 'lena512.png';
}

let rot = 0;
let slices = 100;
let stacks = 100;
let sliceStackInterval = 3;

//Drawn every frame
function render(now) {
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
    GL.enable(GL.DEPTH_TEST);
    // setup shaders and draw cube after the image is loaded

    /* drawShape("Square", rot * 2, 1, [-5, 5, -30]);
    drawShape("Square", rot, 2, [-5, -5, -30], 1);

    drawShape("Sphere", rot * 2, 2, [5, 5, -30]);
    drawShape("Sphere", rot * 2, 2, [5, -5, -30], 1); */


    for (let index = 0; index < 1; index += 1) {
        drawShape("Ball", rot, 0.3, [Math.cos(index) / 2, Math.sin(index) / 2, -3]);
    }

    rot += 0.01;

    if (Math.floor(now) % sliceStackInterval === 0) {
        slices -= slices > 0 ? 1 : -100;
        stacks -= stacks > 0 ? 1 : -100;
    }

    requestAnimationFrame(render);
}

function drawShape(shape, rotation, size, position = [0, 0, 0], textured = 0) {
    let a = size

    let va = [-a, -a, -a]
    let vb = [a, -a, -a]
    let vc = [a, a, -a]
    let vd = [-a, a, -a]
    let ve = [-a, -a, a]
    let vf = [a, -a, a]
    let vg = [a, a, a]
    let vh = [-a, a, a]

    let cr = [1.0, 0.0, 0.0]
    let cy = [1.0, 1.0, 0.0]
    let cg = [0.0, 1.0, 0.0]
    let ct = [0.0, 1.0, 1.0]
    let cb = [0.0, 0.0, 1.0]
    let cm = [1.0, 0.0, 1.0]

    let vertices;
    if (shape === "Square") {
        vertices = [
            // Front face
            ...va, ...cr, ...vd, ...cr, ...vc, ...cr, ...vb, ...cr,
            // Back face
            ...va, ...cy, ...vb, ...cy, ...vf, ...cy, ...ve, ...cy,
            // Left face
            ...vb, ...cg, ...vc, ...cg, ...vg, ...cg, ...vf, ...cg,
            // Right face
            ...vc, ...ct, ...vd, ...ct, ...vh, ...ct, ...vg, ...ct,
            // Top face
            ...vd, ...cb, ...va, ...cb, ...ve, ...cb, ...vh, ...cb,
            // Bottom face
            ...ve, ...cm, ...vf, ...cm, ...vg, ...cm, ...vh, ...cm,
        ];
    }
    else if (shape === "Sphere") {
        vertices = createSphereVertices(size, slices, stacks);
    }
    else if (shape === "Ball") {
        vertices = createBallVertices(size);
    }



    let vertexBuffer = GL.createBuffer()
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW)

    // Stride is 6 * size of float (32 bits / 8 bits per byte = 4 bytes)
    let formatNumLength = 6; //6 = number of elements per "data packing" (position and color)
    let stride = formatNumLength * Float32Array.BYTES_PER_ELEMENT;

    // The offset for each attribute within the vertex
    let positionOffset = 0 * Float32Array.BYTES_PER_ELEMENT;
    let colorOffset = 3 * Float32Array.BYTES_PER_ELEMENT;

    // Configure attribute pointers
    GL.vertexAttribPointer(Shaders.aVertexLoc, 3, GL.FLOAT, false, stride, positionOffset);
    GL.enableVertexAttribArray(Shaders.aVertexLoc);

    GL.vertexAttribPointer(Shaders.aColorLoc, 3, GL.FLOAT, false, stride, colorOffset);
    GL.enableVertexAttribArray(Shaders.aColorLoc);

    //eckpunkt definition aus informations-chunks von vertices    
    let indices;
    if (shape === "Square") {
        indices = [
            0, 1, 2, 0, 2, 3,    // adcb
            4, 5, 6, 4, 6, 7,    // abfe
            8, 9, 10, 8, 10, 11,    // bcgf
            12, 13, 14, 12, 14, 15,    // cdhg
            16, 17, 18, 16, 18, 19,    // daeh
            20, 21, 22, 20, 22, 23     // efgh
        ]
    }
    else if (shape === "Sphere") {
        indices = createSphereIndices(slices, stacks);
    }
    else if (shape === "Ball") {
        indices = createBallIndices(vertices.length / 3);
    }


    indexBuffer = GL.createBuffer()
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer)
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), GL.STATIC_DRAW)


    if (textured === 1) {
        let textureBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, textureBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(TexCoords), GL.STATIC_DRAW);
        GL.vertexAttribPointer(Shaders.aTextureId, 2, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(Shaders.aTextureId);

        GL.uniform1i(Shaders.uEnableTextureID, 1);

        let image = new Image();
        let texObj = GL.createTexture();
        image.onload = function () {
            GL.bindTexture(GL.TEXTURE_2D, texObj);
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
            GL.generateMipmap(GL.TEXTURE_2D);
            GL.bindTexture(GL.TEXTURE_2D, null);
            GL.activeTexture(GL.TEXTURE0);
            GL.bindTexture(GL.TEXTURE_2D, texObj);
            GL.uniform1i(Shaders.uSamplerID, 0);
        }
        image.src = 'lena512.png';
    }
    else {
        GL.uniform1i(Shaders.uEnableTextureID, 0);
    }

    //View settings and matrix transforms
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = GL.canvas.clientWidth / GL.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    let cubeRotation = rotation;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        position
    ); // amount to translate

    mat4.rotate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to rotate
        cubeRotation, // amount to rotate in radians
        [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to rotate
        cubeRotation * 0.7, // amount to rotate in radians
        [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to rotate
        cubeRotation * 0.3, // amount to rotate in radians
        [1, 0, 0]
    ); // axis to rotate around (X)

    //Saves matrix into shaders
    GL.uniformMatrix4fv(Shaders.uModelViewLoc, false, modelViewMatrix)
    GL.uniformMatrix4fv(Shaders.uProjectionLoc, false, projectionMatrix)


    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer)
    GL.enable(GL.DEPTH_TEST)
    GL.drawElements(GL.TRIANGLES, indices.length, GL.UNSIGNED_BYTE, 0)
}

function createBallVertices(size) {
    let ballVertices = [];
    let x, y, z;

    let cr = [1.0, 0.0, 0.0]
    let cy = [1.0, 1.0, 0.0]

    //iterate over angles of ball
    for (let phi = 0; phi <= 8; phi++) {
        for (let theta = 0; theta < 16; theta++) {
            //Draw 4 corners of face
            for (let phiMod = -1; phiMod <= 1; phiMod += 2) {
                for (let thetaMod = -1; thetaMod <= 1; thetaMod += 2) {
                    let newPhi = phi * Math.PI / 8 + phiMod * Math.PI / 18;
                    let newTheta = theta * Math.PI / 8 + thetaMod * Math.PI / 18;
                    
                    x = size * Math.sin(newPhi)  * Math.cos(newTheta);
                    y = size * Math.sin(newPhi)  * Math.sin(newTheta);
                    z = size * Math.cos(newPhi); 

                    //represents face corner
                    ballVertices.push(...[x, y, z]);

                    //randomly color corners yellow or red
                    let color = /* Math.random() > 0.5 ? cr :  */cr;
                    ballVertices.push(...color);
                }
            }
        }
    }

    return ballVertices;
}

function createBallIndices(faceNum) {
    let ballIndices = [];
    for (let index = 0; index < faceNum; index++) {
        // 0, 1, 2, 0, 2, 3,    // adcb
        ballIndices.push(index * 4);
        ballIndices.push((index * 4) + 3);
        ballIndices.push((index * 4) + 1);
        ballIndices.push(index * 4);
        ballIndices.push((index * 4) + 2);
        ballIndices.push((index * 4) + 3);
    }

    return ballIndices;
}

function createSphereVertices(radius, slices, stacks) {
    let vertices = [];
    for (let stack = 0; stack <= stacks; ++stack) {
        let theta = stack * Math.PI / stacks;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);
        for (let slice = 0; slice <= slices; ++slice) {
            let phi = slice * 2 * Math.PI / slices;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);
            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;
            vertices.push(radius * x, radius * y, radius * z);
        }
    }
    return vertices;
}

function createSphereIndices(slices, stacks) {
    let indices = [];
    for (let stack = 0; stack < stacks; ++stack) {
        for (let slice = 0; slice < slices; ++slice) {
            let first = (stack * (slices + 1)) + slice;
            let second = first + slices + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    return indices;
}
