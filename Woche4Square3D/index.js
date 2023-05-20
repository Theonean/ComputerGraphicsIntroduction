let canvas, gl, program;

let aVertexPositionId, aVertexColorId;
let wiredCube;

window.onload = function () {
    // Get the canvas element and create a WebGL context
    canvas = document.getElementById('myCanvas');
    gl = canvas.getContext('webgl');

    // Check for WebGL support
    if (!gl) {
        console.error('WebGL is not supported by your browser.');
    }

    // Define the vertex and fragment shaders
    const vertexShaderSource = `
    attribute vec3 aVertexPosition;
    uniform mat4 uProjectionMat;
    
    varying float vZ;  // Declare a varying variable to pass the z-value to the fragment shader


    void main() {
        gl_Position = uProjectionMat * vec4(aVertexPosition, 1.0);
    }
`;

    const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 aColor;

    varying float vZ;  // Declare the same varying variable to receive the z-value from the vertex shader

    void main ()
    {
        float alpha = 1.0 - clamp(abs(vZ), 0.0, 1.0); // Compute the alpha based on the z-value. Adjust the denominator to scale the z-value to the range [0, 1]
        gl_FragColor = vec4 (aColor, alpha);
    }
`;

    // Create and compile the vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Create and compile the fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create and link the shader program
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Use the shader program
    gl.useProgram(program);

    // Clear the canvas and set the viewport
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    uProjectionMatId = gl.getUniformLocation(program, 'uProjectionMat');
    aVertexPositionId = gl.getAttribLocation(program, "aVertexPosition");
    aVertexColorId = gl.getUniformLocation(program, "aColor");

    wiredCube = new WireFrameCube(gl, [1.0, 1.0, 1.0, 0.5]);
    console.log(wiredCube);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader failed to compile: ' + gl.getShaderInfoLog(vertexShader));
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader failed to compile: ' + gl.getShaderInfoLog(fragmentShader));
    }

    // Request the next frame (to maek squer circle yey)
    window.requestAnimationFrame(drawAnimated);
}

let previousTimeStamp = null;
let cameraAngle = 0;
function drawAnimated(timeStamp) {
    if (previousTimeStamp === null) {
        previousTimeStamp = timeStamp;
    }

    // Calculate time since last call in seconds
    const deltaTime = (timeStamp - previousTimeStamp) / 1000;
    previousTimeStamp = timeStamp;

    //do calculations on objects before rendering

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set up the world coordinates    
    let fieldOfView = Math.PI / 4; // 45 degrees
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let near = 0.1;
    let far = 100.0;
    let projectionMat = mat4.create();
    mat4.perspective(projectionMat, fieldOfView, aspect, near, far);

    // Apply the looking direction
    let modificationMatrix = mat4.create();

    //clamps i between 0 and two pi or adds a bit to angle
    cameraAngle += cameraAngle < (Math.PI * 2) ? 0.01 : -Math.PI * 2;;

    let eye = vec3.fromValues(10, 10, 20); // Camera is at (0,0,0)
    let center = vec3.fromValues(0.5, 0.5, 0.5); // Looks at the origin
    let up = vec3.fromValues(0, 1, 0); // "Up" is in positive Y direction

    // To this
    let lookProjectionMat = mat4.create();
    mat4.lookAt(lookProjectionMat, eye, center, up);
    mat4.multiply(modificationMatrix, projectionMat, lookProjectionMat);

    // Pass the modified projection matrix to the shader
    gl.uniformMatrix4fv(uProjectionMatId, false, modificationMatrix);

    // Rendering
    wiredCube.draw(gl, aVertexPositionId, aVertexColorId);

    // Request the next frame
    //window.requestAnimationFrame(drawAnimated);
}