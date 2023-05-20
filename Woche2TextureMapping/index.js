let vertexShaderSource =
    `
    attribute vec2 aVertex;
    attribute vec2 aTexture;

    varying vec2 vTexture;

    void main ()
    {
        gl_Position = vec4 (aVertex, 0.0, 1.0);
        vTexture = aTexture;
    }
`;



let fragmentShaderSource =
    `
    precision mediump float;

    varying vec2 vTexture;

    uniform sampler2D uSampler;

    void main ()
    {
        gl_FragColor = texture2D (uSampler, vTexture);
    }
`;


//Points on canvas 
let Vertices =
    [
        -0.9, -0.9,
        0.9, -0.9,
        0.9, 0.9,
        -0.9, 0.9
    ];


//points on texture
let TexCoords =
    [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];



let gl;

window.onload = function () {
    let canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl");

    let vertexShader = gl.createShader(gl.VERTEX_SHADER); //create vertext shader
    gl.shaderSource(vertexShader, vertexShaderSource); //load source
    gl.compileShader(vertexShader); //compile vertex shader

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //create fragmentshader
    gl.shaderSource(fragmentShader, fragmentShaderSource); //load fragmentshader
    gl.compileShader(fragmentShader); //compile created fragmentshader

    shaderProgram = gl.createProgram(); //create shaderprogramm 
    gl.attachShader(shaderProgram, vertexShader); //attach vertextshader to shader
    gl.attachShader(shaderProgram, fragmentShader); //attach fragment to shader
    gl.linkProgram(shaderProgram); //link
    gl.useProgram(shaderProgram); //use

    gl.clearColor(0.3, 0.2, 0.7, 1.0);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer (gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (Vertices), gl.STATIC_DRAW );

    let aVertexId = gl.getAttribLocation (shaderProgram, "aVertex");
    gl.vertexAttribPointer (aVertexId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray (aVertexId);

    let textureBuffer = gl.createBuffer();
    gl.bindBuffer (gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (TexCoords), gl.STATIC_DRAW );
    
    let aTextureId = gl.getAttribLocation (shaderProgram, 'aTexture');
    gl.vertexAttribPointer (aTextureId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray (aTextureId);

    let uSamplerId = gl.getUniformLocation (shaderProgram, "uSampler");

    let image = new Image();
    let texObj = gl.createTexture();
    image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, texObj);
        gl.pixelStorei(gl. UNPACK_FLIP_Y_WEBGL , true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER , gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER , gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texObj);
        gl.uniform1i(uSamplerId , 0);
        draw();
    }
    image.src = 'lena512.png';

    draw();
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, Vertices.length / 2);
}

// keep texture parameters in an object so we can mix textures and objects
var lennaTxt =
{
    textureObj: {}
};