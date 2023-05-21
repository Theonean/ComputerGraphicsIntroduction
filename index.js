let shapes = [];
let shapeInterval = 20;
let maxShapes = 300;
let speed = 2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let index = 0; index < maxShapes; index++) {
        createSquare(random(windowWidth), random(windowHeight), random(20, 100));
    }

}

function createSquare(x, y, size) {
    shapes.push(new Shape(x, y, size));
}

function draw() {
    background(0);
    for (let i = 0; i < shapes.length; i++) {
        shapes[i].display();
        shapes[i].update();
        if (shapes[i].isOffScreen()) {
            shapes.splice(i, 1);
            let x = random(width);
            let y = random(height);
            let size = random(20, 100);
            shapes.push(new Shape(x, y, size));
        }
    }
}

class Shape {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    update() {
        this.y += speed;
    }

    display() {
        noStroke();
        fill(255);
        ellipse(this.x, this.y, this.size, this.size);
    }

    isOffScreen() {
        return this.y > height + this.size / 2;
    }
}
