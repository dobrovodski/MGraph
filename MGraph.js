class MGraph {

    constructor(htmlElement) {
        this.drawCanvas = this.attachCanvas(htmlElement, 1);
        this.drawCtx = this.drawCanvas.getContext('2d');
        this.drawCtx.translate(this.drawCanvas.width / 2, this.drawCanvas.height / 2);

        this.gridCanvas = this.attachCanvas(htmlElement, 0);
        this.gridCtx = this.gridCanvas.getContext('2d');
        this.gridCtx.translate(this.gridCanvas.width / 2, this.gridCanvas.height / 2);

        this.config = {
            width: htmlElement.getBoundingClientRect().width,
            height: htmlElement.getBoundingClientRect().height,

            //If these are two are changed, you have to clear drawCtx
            originCoordinates: { x: 0, y: 0 }, //Defines which coordinates should be the center
            unit: 20, //Width of a single unit in pixels

            bgColor: '#FAFAFA', //Background color
            gridlineColor: '#BABABA', //Color of graph paper lines
            gridlineWidth: 1,
            gridlineDash: [1, 4], //[0,0] for full line

            axesColor: 'black',
            axesLabels: true,
            axesWidth: 1,

            font: '12px Arial',
            fontColor: '#3F51B5'
        };

        this.drawGridLayer();
    }

    attachCanvas(el, zIndex) {
        let c = document.createElement('canvas');
        el.appendChild(c);

        let dimensions = el.getBoundingClientRect();
        c.style.cssText = 'position: absolute; left: 0; top:0; z-index:' + zIndex + ';';
        c.height = dimensions.height;
        c.width = dimensions.width;

        return c;
    }

    //Draws points at (x,y)
    point(x, y, radius = 3, color = 'black', ctx = this.drawCtx) {
        let p = this.coordinateToPixel(x, y);
        x = p.x;
        y = p.y;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    //Draws line form (x1, y1) to (x2, y2)
    line(x1, y1, x2, y2, width = 1, color = 'black', ctx = this.drawCtx) {
        let p = this.coordinateToPixel(x1, y1);
        x1 = p.x;
        y1 = p.y;

        p = this.coordinateToPixel(x2, y2);
        x2 = p.x;
        y2 = p.y;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineWidth = width;
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    //Draws a rectangle at (x,y) with a width of w and a height of h
    rect(x, y, w, h, color = 'black', ctx = this.drawCtx) {
        let p = this.coordinateToPixel(x, y);
        x = p.x;
        y = p.y;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    cross(x, y, size = 0.5, width = 1, color = 'red', ctx = this.drawCtx) {
        let x1 = x - size / 2;
        let x2 = x + size / 2;
        let y1 = y - size / 2;
        let y2 = y + size / 2;
        this.line(x1, y2, x2, y1, width, color, ctx);
        this.line(x1, y1, x2, y2, width, color, ctx);
    }

    //Gets the furthest x and y coordinates that are drawn onto the canvas
    getBoundingCoordinates() {
        let positiveCoords = this.pixelToCoordinate(this.config.width, this.config.height);
        let negativeCoords = this.pixelToCoordinate(0, 0);
        return { right: positiveCoords.x, up: positiveCoords.y, left: negativeCoords.x, down: negativeCoords.y };
    }

    //Turns a pixel coordinate into a cartesian (x, y) coordinate
    pixelToCoordinate(px, py) {
        let c = this.drawCanvas;
        let x = (px - c.width / 2 + this.config.unit * this.config.originCoordinates.x) / this.config.unit;
        let y = (py - c.height / 2 + this.config.unit * this.config.originCoordinates.y) / this.config.unit;
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
        let ctx = this.gridCtx;
        let cfg = this.config;
        ctx.fillStyle = color || this.config.bgColor;
        ctx.fillRect(-cfg.width / 2, -cfg.height / 2, cfg.width, cfg.height);
    }

    //Draws the x and y axes
    drawAxes() {
        let ctx = this.gridCtx;
        let coords = this.getBoundingCoordinates();
        this.line(coords.left, 0, coords.right, 0, this.config.axesWidth, this.config.axesColor, ctx);
        this.line(0, coords.down, 0, coords.up, this.config.axesWidth, this.config.axesColor, ctx);
    }

    //Draws the grid of the graph
    drawGrid() {
        let ctx = this.gridCtx;

        let bounding = this.getBoundingCoordinates();
        let startX = Math.floor(bounding.left);
        let startY = Math.floor(bounding.down);
        let endX = Math.ceil(bounding.right);
        let endY = Math.ceil(bounding.up);

        ctx.setLineDash(this.config.gridlineDash);

        for (let i = startX; i < endX; i++) {
            let x1 = i;
            let x2 = i;
            let y1 = startY;
            let y2 = endY;
            this.line(x1, y1, x2, y2, this.config.gridlineWidth, this.config.gridlineColor, ctx);
        }

        for (let i = startY; i < endY; i++) {
            let x1 = startX;
            let x2 = endX;
            let y1 = i;
            let y2 = i;
            this.line(x1, y1, x2, y2, this.config.gridlineWidth, this.config.gridlineColor, ctx);
        }

        ctx.setLineDash([]);
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
        let ctx = this.gridCtx;
        let p = this.coordinateToPixel(x, y);
        x = p.x + xPixelOffset;
        y = p.y + yPixelOffset;

        ctx.fillStyle = this.config.fontColor;
        ctx.font = this.config.font;
        ctx.fillText(text, x, y);
    }

    //Clears the graph completely and re-applies the config
    clear(ctx) {
        ctx.clearRect(-this.config.width / 2, -this.config.height / 2, this.config.width, this.config.height);
    }

    drawGridLayer() {
        this.clear(this.gridCtx);
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