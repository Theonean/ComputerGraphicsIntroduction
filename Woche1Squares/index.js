let gl = null;
shaderProgram = null;

const paletteTypes = {
    MONOCHROMATIC: "monochromatic",
    ANALOGOUS: "analogous",
    COMPLEMENTARY: "complementary",
    SPLIT_COMPLEMENTARY: "split-complementary",
    TRIAD: "triad",
    TETRADIC: "tetradic",
};

window.onload = function () {
    let canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl");
    var topleft = 0.5;
    var topright = 0.5;
    let vertexShaderSource =
        `
        attribute vec2 aVertexPosition;

        void main ()
        {
            gl_Position = vec4 (aVertexPosition, 0.0, 1.0);
            gl_PointSize = 10.0;
        }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    let fragmentShaderSource =
        `
        precision mediump float;
        uniform vec3 aColor;
        void main ()
        {
            gl_FragColor = vec4 (aColor, 1.0);
        }
    `;

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    //background 
    let vertices =
        [
            -topright, -topright,
            topleft, -topright,
            topleft, topleft,
            -topright, topleft
        ];

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    //POINTS

    gl.clearColor(0.3, 0.2, 0.7, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let squareNum = 1000 * (Math.random() * 10);
    console.log("Drawing squares: " + squareNum)

    //adding and drawing squares to canvas with time measurement
    const start = performance.now();
    addSquare(squareNum);
    const end = performance.now();
    const executionTime = end - start;

    console.log(`Execution time to draw squares: ${executionTime} milliseconds`);
}

function addSquare(num) {

    let aVertexPositionId = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    let aSquareColorLocation = gl.getUniformLocation(shaderProgram, "aColor");

    //Palette generation
    const paletteSize = Math.random() * 5 + 2;
    const paletteType = Object.values(paletteTypes)[Math.floor(Math.random() * Object.values(paletteTypes).length)];

    const palette = generatePalette(paletteSize, paletteType);

    //Administrative stuff, displays info and logs it
    console.log("|Palette information|");
    console.log("Type: " + paletteType);
    console.log("Amount of Colors: " + paletteSize);
    console.log("Red Array:", palette.red);
    console.log("Green Array:", palette.green);
    console.log("Blue Array:", palette.blue);

    const paletteInfoDiv = document.getElementById("paletteInfo");

    paletteInfoDiv.innerHTML = `
    <h4>Palette information</h4>
    <p>Type: ${paletteType}</p>
    <p>Amount of Colors: ${paletteSize}</p>
    <p>Red Array: ${palette.red.join(", ")}</p>
    <p>Green Array: ${palette.green.join(", ")}</p>
    <p>Blue Array: ${palette.blue.join(", ")}</p>`;

    //create num amount of squares
    for (let index = 0; index < num; index++) {
        let vertices = [];
        let randomMoveX = Math.random() * 2 - 1;
        let randomMoveY = Math.random() * 2 - 1;
        let squareColor = Math.round(Math.random() * (paletteSize - 1));

        /*
        const firstColorRed = palette.red[squareColor];
        const firstColorGreen = palette.green[squareColor];
        const firstColorBlue = palette.blue[squareColor];
        
        console.log(squareColor +  " color RGB values:", firstColorRed, firstColorGreen, firstColorBlue);
        */

        const squareVertices = createSquareVertices(Math.random() * Math.random());
        //iterate over square vertices and move them together into a direction
        for (let i = 0; i < squareVertices.length; i += 2) {
            vertices.push(squareVertices[i] + randomMoveX);
            vertices.push(squareVertices[i + 1] + randomMoveY);
        }

        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
        
        gl.vertexAttribPointer(aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPositionId);

        // Set the square color
        gl.uniform3f(aSquareColorLocation, palette.red[squareColor], palette.green[squareColor], palette.blue[squareColor]);

        // Draw the square
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
}


function createSquareVertices(size) {
    const halfSize = size / 2.0;

    const topLeft = [-halfSize, halfSize];
    const topRight = [halfSize, halfSize];
    const bottomRight = [halfSize, -halfSize];
    const bottomLeft = [-halfSize, -halfSize];

    return [
        ...topLeft,
        ...topRight,
        ...bottomRight,
        ...bottomLeft
    ];
}

function generatePalette(size, paletteType) {
    const arrayRGBRed = [];
    const arrayRGBGreen = [];
    const arrayRGBBlue = [];

    const baseHue = Math.random();

    for (let i = 0; i < size; i++) {
        let hue;

        switch (paletteType) {
            case "monochromatic":
                hue = baseHue;
                break;
            case "analogous":
                hue = (baseHue + i / 12) % 1;
                break;
            case "complementary":
                hue = (baseHue + i / size) % 1;
                break;
            case "split-complementary":
                hue = (baseHue + i / (size * 2)) % 1;
                break;
            case "triad":
                hue = (baseHue + i / 3) % 1;
                break;
            case "tetradic":
                hue = (baseHue + i / 4) % 1;
                break;
            default:
                throw new Error("Invalid palette type: " + paletteType);
        }

        const rgb = hslToRgb(hue, Math.random(), Math.random());

        arrayRGBRed.push(rgb[0]);
        arrayRGBGreen.push(rgb[1]);
        arrayRGBBlue.push(rgb[2]);
    }

    return {
        red: arrayRGBRed,
        green: arrayRGBGreen,
        blue: arrayRGBBlue,
    };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];//[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}