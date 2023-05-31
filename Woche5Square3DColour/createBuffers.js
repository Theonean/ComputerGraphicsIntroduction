function createBuffer(shape) {
    let bufferInfo = {};
    // Create vertex buffer
    if (shape === "Square") {
        bufferInfo.vertexBuffer = createVertexBuffer(vertices);
    }
    else if (shape === "Sphere") {
        // TODO: Optimize createSphereVertices
        let vertices = createSphereVertices(size, slices, stacks);
        bufferInfo.vertexBuffer = createVertexBuffer(vertices);
    }
    else if (shape === "Ball") {
        // TODO: Optimize createBallVertices
        let vertices = createBallVertices(size);
        bufferInfo.vertexBuffer = createVertexBuffer(vertices);
    }
    // Create index buffer
    if (shape === "Square") {
        bufferInfo.indexBuffer = createIndexBuffer(indices);
    }
    else if (shape === "Sphere") {
        // TODO: Optimize createSphereIndices
        let indices = createSphereIndices(slices, stacks);
        bufferInfo.indexBuffer = createIndexBuffer(indices);
    }
    else if (shape === "Ball") {
        // TODO: Optimize createBallIndices
        let indices = createBallIndices(vertices.length / 8);
        bufferInfo.indexBuffer = createIndexBuffer(indices);
    }
    return bufferInfo;
}

function createVertexBuffer(vertices) {
    let vertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);
    return vertexBuffer;
}

function createIndexBuffer(indices) {
    let indexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), GL.STATIC_DRAW);
    return indexBuffer;
}