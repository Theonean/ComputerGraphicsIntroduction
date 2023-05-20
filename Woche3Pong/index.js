let canvas, gl, program;

let uProjectionMatId, aSquareColorLocation, aVertexPositionId;

let squares;

let playerPaddle, ball, cpuPaddle;
let ballVelocity = { x: 100, y: 30 };
let paddleSpeed = 50;

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
    attribute vec2 aVertexPosition;
    uniform mat3 uProjectionMat;

    void main() {
        gl_Position = vec4(uProjectionMat * vec3(aVertexPosition, 1.0), 1.0);
    }
`;

    const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 aColor;

    void main() {
        gl_FragColor = vec4(aColor); // color parameter
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

    //Palette generation
    const paletteSize = Math.random() * 10 + 2;

    let palette = generatePalette(paletteSize, "split-complementary");
    let squareColor = Math.round(Math.random() * (paletteSize - 1));
    let colorFromPallete = [palette.red[squareColor], palette.green[squareColor], palette.blue[squareColor], 1];
    // Set up the world coordinates with projection Matrix
    uProjectionMatId = gl.getUniformLocation(program, 'uProjectionMat');
    aSquareColorLocation = gl.getUniformLocation(program, "aColor");
    aVertexPositionId = gl.getAttribLocation(program, "aVertexPosition");

    //squares to be drawn, easier than spamming addsquare lines
    squares = [
        { width: 20, height: gl.drawingBufferHeight, x: 0, y: 0, color: [0, 1, 0, 1] }, // Green square
        { width: 20, height: 75, x: -(gl.drawingBufferWidth / 10) * 4.8, y: 0, color: [0, 0, 1, 1] }, // Blue square
        { width: 20, height: 75, x: (gl.drawingBufferWidth / 10) * 4.8, y: 0, color: [1, 1, 0, 1] }, // Yellow square
        { width: 20, height: 20, x: -100, y: -100, color: [1, 0, 0, 1] } // Red square
    ];


    for (let index = 0; index < squares.length; index++) {
        let square = squares[index];
        addSquare(square.width, 
            square.height, 
            mat3.fromTranslation(mat3.create(), [square.x, square.y]), square.color);
    }

    playerPaddle = squares[1];
    cpuPaddle = squares[2];
    ball = squares[3];

    // Request the next frame
    window.requestAnimationFrame(drawAnimated);

    // Add event listeners
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);

    //midline
    //addSquare(20, gl.drawingBufferHeight, mat3.fromTranslation(mat3.create(), [0, 0]), colorFromPallete);

}

function updateSquarePosition(square, deltaTime) {
    // Update the square's position based on elapsed time
    square.x += 50 * deltaTime; // Move the square 50 units per second
}

function movePaddle(inputType, paddle, deltaTime) {
    // Update the square's position based on elapsed time
    if (inputType === "USERINPUT") {
        if (key._pressed[key.UP]) {
            paddle.y += paddleSpeed * deltaTime; // Move the square 30 units per second
        } else if (key._pressed[key.DOWN]) {
            paddle.y -= paddleSpeed * deltaTime; // Move the square 30 units per second
        }
        paddle.y = clamp(paddle.y, -canvas.height / 2, canvas.height / 2);
        //console.log(paddle.y);
    } else if (inputType === "CPU") {
        const distance = ball.y - paddle.y;
        const direction = distance > 0 ? 1 : -1;

        // Move the paddle based on the direction, speed, and deltaTime
        const moveAmount = direction * paddleSpeed * deltaTime;

        // Check if the moveAmount would overshoot the ball's y position
        if (Math.abs(moveAmount) > Math.abs(distance)) {
            paddle.y = ball.y;
        } else {
            paddle.y += moveAmount;
        }
    }
}

function moveBall(deltaTime) {
    //ball is on left or right screen side (touching paddle?)
    if (ball.x - ball.width / 2 <= -canvas.width / 2 ||
        ball.x + ball.width / 2 >= canvas.width / 2) {
        ballVelocity.x *= -1;
    }

    //ball is on top or bottom screen side (touching paddle?)
    if (ball.y - ball.height / 2 <= -canvas.height / 2 ||
        ball.y + ball.height / 2 >= canvas.height / 2) {
        ballVelocity.y *= -1;
    }

    if (areAreasIntersecting(ball, playerPaddle)) {
        ballVelocity.x *= -1;
        ballVelocity.y = ball.y - playerPaddle.y;
    }

    if (areAreasIntersecting(ball, cpuPaddle)) {
        ballVelocity.x *= -1;
        ballVelocity.y = ball.y - cpuPaddle.y;
    }

    //ballVelocity.x += Math.random() ;
    //ballVelocity.y += Math.random() ;

    //move the ball in given direction
    ball.x += ballVelocity.x * deltaTime;
    ball.y += ballVelocity.y * deltaTime;
    //ball.width = Math.abs(ballVelocity.x);//clamp(ball.width * (1+ (Math.random() - 0.5)/10),20,50);
    //ball.height = Math.abs(ballVelocity.y);//clamp(ball.height * (1 + (Math.random() - 0.5)/10),20,50);
}


let previousTimeStamp = null;

function drawAnimated(timeStamp) {
    if (previousTimeStamp === null) {
        previousTimeStamp = timeStamp;
    }

    // Calculate time since last call in seconds
    const deltaTime = (timeStamp - previousTimeStamp) / 1000;
    previousTimeStamp = timeStamp;

    // Update the first square's X position
    //updateSquarePosition(squares[0], deltaTime);

    moveBall(deltaTime);
    movePaddle("USERINPUT", playerPaddle, deltaTime);
    movePaddle("CPU", cpuPaddle, deltaTime);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Redraw the squares
    for (let index = 0; index < squares.length; index++) {
        let square = squares[index];
        addSquare(square.width, square.height, mat3.fromTranslation(mat3.create(), [square.x, square.y]), square.color);
    }

    // Request the next frame
    window.requestAnimationFrame(drawAnimated);
}

function addSquare(width, height, modificationMatrix, c) {
    // Define the square's vertices (2 triangles) based on width and height
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const vertices = new Float32Array([
        -halfWidth, -halfHeight,
        halfWidth, -halfHeight,
        -halfWidth, halfHeight,
        -halfWidth, halfHeight,
        halfWidth, -halfHeight,
        halfWidth, halfHeight
    ]);

    // Update the vertex buffer with the new vertices
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Set up the world coordinates
    var projectionMat = mat3.create();
    mat3.fromScaling(projectionMat, [2.0 / gl.drawingBufferWidth,
    2.0 / gl.drawingBufferHeight]);

    // Apply the modification matrix to the projection matrix
    let modifiedProjectionMat = mat3.create();
    mat3.multiply(modifiedProjectionMat, projectionMat, modificationMatrix);

    // Pass the modified projection matrix to the shader
    gl.uniformMatrix3fv(uProjectionMatId, false, modifiedProjectionMat);

    gl.vertexAttribPointer(aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPositionId);

    // Set the square color
    gl.uniform4f(aSquareColorLocation, c[0], c[1], c[2], c[3]);

    // Draw the square
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Key Handling
var key =
{
    _pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

function isDown(keyCode) {
    return key._pressed[keyCode];
}

function onKeydown(event) {
    console.log("down: " + event.keyCode);
    key._pressed[event.keyCode] = true;
    console.log(key._pressed);
}

function onKeyup(event) {
    console.log("up: " + event.keyCode)
    delete key._pressed[event.keyCode];
}