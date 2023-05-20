/* *
* Define a wire frame cube with methods for drawing it .
*
* @param gl the webgl context
* @param color the color of the cube
* @returns object with draw method
* @constructor
*/
function WireFrameCube(gl, color) {
    function defineVertices(gl) {
        // define the vertices of the cube

        var vertices =
            [
                0, 0, 0, // v0
                1, 0, 0, // vx
                0, 1, 0, // vy
                1, 1, 0, // vcorner
                0, 0, 1, // vdepth
                0, 1, 1, // vdepth
                1, 0, 1, // vdepth
                1, 1, 1, // vdepth
            ];
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
            gl.STATIC_DRAW);
        return buffer;
    }

    function defineEdges(gl) {

        // define the edges for the cube , there are 12 edges in a cube

        var vertexIndices =
            [
                0, 1,
                0, 2,
                1,3,
                2,3,
                0,4,
                2,5,
                1,6,
                3,7,
                4,5,
                6,7,
                4,6,
                5,7

            ];

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        return buffer;
    }

    return {
        bufferVertices: defineVertices(gl),
        bufferEdges: defineEdges(gl),
        color: color,
        draw: function (gl, aVertexPositionId, aVertexColorId, z) {
            //call draw elements with buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
            gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aVertexPositionId);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferEdges);

            // Set the square color
            gl.uniform3f(aVertexColorId, this.color[0], this.color[1], this.color[2], z);

            gl.drawElements(gl.LINES, 24 /* Anzahl Indices */, gl.UNSIGNED_SHORT, 0);
        }
    }
}