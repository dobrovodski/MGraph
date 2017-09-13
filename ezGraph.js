class ezGraph {

    constructor(canvas) {
        this.canvas = canvas;

        this.config = {
            width: window.innerWidth * 0.99, //Width of canvas
            height: window.innerHeight * 0.98, //Height of canvas

            originCoordinates: { x: 0, y: 0 }, //Defines which coordinates should be the center
            unit: 20, //Width of a single unit in pixels

            bgColor: '#FAFAFA', //Background color
            gridlineColor: '#bababa', //Color of graph paper lines
            gridlineWidth: 1,
            gridlineDash: [1, 4], //[0,0] for full line

            axesColor: 'black',
            axesLabels: true,
            axesWidth: 1,

            font: '12px Arial',
            fontColor: '#3F51B5'
        };

        this.ctx = this.canvas.getContext('2d');
        this.canvas.height = this.config.height;
        this.canvas.width = this.config.width;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        this.clear();
    }

    //Draws points at (x,y)
    point(x, y, radius = 3, color = 'black') {
        let p = this.coordinateToPixel(x, y);
        x = p.x;
        y = p.y;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    //Draws line form (x1, y1) to (x2, y2)
    line(x1, y1, x2, y2, width = 1, color = 'black') {
        let p = this.coordinateToPixel(x1, y1);
        x1 = p.x;
        y1 = p.y;

        p = this.coordinateToPixel(x2, y2);
        x2 = p.x;
        y2 = p.y;

        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineWidth = width;
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    //Draws a rectangle at (x,y) with a width of w and a height of h
    rect(x, y, w, h, color = 'black') {
        let p = this.coordinateToPixel(x, y);
        x = p.x;
        y = p.y;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    cross(x, y, size = 0.5, width = 1, color = 'red') {
        let x1 = x - size / 2;
        let x2 = x + size / 2;
        let y1 = y - size / 2;
        let y2 = y + size / 2;
        this.line(x1, y2, x2, y1, width, color);
        this.line(x1, y1, x2, y2, width, color);

    }

    //Gets the furthest x and y coordinates that are drawn onto the canvas
    getBoundingCoordinates() {
        let positiveCoords = this.pixelToCoordinate(this.canvas.width, this.canvas.height);
        let negativeCoords = this.pixelToCoordinate(0, 0);
        return { right: positiveCoords.x, up: positiveCoords.y, left: negativeCoords.x, down: negativeCoords.y };
    }

    //Turns a pixel coordinate into a cartesian (x, y) coordinate
    pixelToCoordinate(px, py) {
        let x = (px - this.canvas.width / 2 + this.config.unit * this.config.originCoordinates.x) / this.config.unit;
        let y = (py - this.canvas.height / 2 + this.config.unit * this.config.originCoordinates.y) / this.config.unit;
        return { x: x, y: y };
    }

    //Turns a cartesian (x,y) coordinate to canvas pixel space
    coordinateToPixel(x, y) {
        let px = (x - this.config.originCoordinates.x) * this.config.unit;
        let py = (- y + this.config.originCoordinates.y) * this.config.unit;
        return { x: px, y: py };
    }

    //Sets the background color
    drawBackground(color) {
        this.ctx.fillStyle = color || this.config.bgColor;
        this.ctx.fillRect(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height);
    }

    //Draws the x and y axes
    drawAxes() {
        let coords = this.getBoundingCoordinates();
        console.log(coords);
        this.line(coords.left, 0, coords.right, 0, this.config.axesColor, this.config.axesWidth);
        this.line(0, coords.down, 0, coords.up, this.config.axesColor, this.config.axesWidth);
    }

    //Draws the grid of the graph
    drawGrid() {
        let bounding = this.getBoundingCoordinates();
        let startX = Math.floor(bounding.left);
        let startY = Math.floor(bounding.down);
        let endX = Math.ceil(bounding.right);
        let endY = Math.ceil(bounding.up);

        this.ctx.setLineDash(this.config.gridlineDash);

        for (let i = startX; i < endX; i++) {
            let x1 = i;
            let x2 = i;
            let y1 = startY;
            let y2 = endY;
            this.line(x1, y1, x2, y2, this.config.gridlineColor, this.config.gridlineWidth);
        }

        for (let i = startY; i < endY; i++) {
            let x1 = startX;
            let x2 = endX;
            let y1 = i;
            let y2 = i;
            this.line(x1, y1, x2, y2, this.config.gridlineColor, this.config.gridlineWidth);
        }

        this.ctx.setLineDash([]);
    }

    //Draws numbers onto the x and y axes
    drawGraphNumbers() {
        let bc = this.getBoundingCoordinates();
        let startX = Math.floor(bc.left);
        let startY = Math.floor(bc.down);
        let endX = Math.ceil(bc.right);
        let endY = Math.ceil(bc.up);

        //Magic numbers
        let intermission = this.config.unit <= 20 ? 3 : 1;

        //For the love of god, fix the magic numbers
        for (let i = startX; i < endX; i += intermission) {
            if (i === 0)
                continue;
            if (i < 0)
                this.drawText(i, i, 0, -5, 15)
            else
                this.drawText(i, i, 0, 0, 15);
        }

        for (let i = startY; i < endY; i += intermission) {
            if (i === 0)
                continue;
            if (i < 0)
                this.drawText(i, 0, i, 8, 3);
            else
                this.drawText(i, 0, i, 10, 3);
        }

    }


    //Draws given text onto the (x, y) location with an offset
    drawText(text, x, y, xPixelOffset, yPixelOffset) {
        let p = this.coordinateToPixel(x, y);
        x = p.x + xPixelOffset;
        y = p.y + yPixelOffset;

        this.ctx.fillStyle = this.config.fontColor;
        this.ctx.font = this.config.font;
        this.ctx.fillText(text, x, y);
    }

    //Clears the graph completely and re-applies the config
    clear() {
        this.canvas.height = this.config.height;
        this.canvas.width = this.config.width;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.clearRect(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawGrid();
        this.drawAxes();
        if (this.config.axesLabels) {
            this.drawGraphNumbers();
        }
    }

    //Changes the default configuration of the graph
    //Applied after calling the clear() method
    setConfig(config) {
        for (let [k, v] of Object.entries(config)) {
            this.config[k] = v;
        }
    }
}