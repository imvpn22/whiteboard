
// Testing
var clrBox, toolSize, wboard;

const MODE = { TOOL: 0, DRAW: 1 };
const TOOL_MODE = { PEN: 0, ERASER: 1 }
const DRAW_MODE = { PATH_BEGIN: 0, PATH_INSERT: 1, PATH_END: 2, IDLE: 3 }

class Whiteboard {
    constructor(wrapperID, canvasID) {
        this.tool = TOOL_MODE.PEN;
        this.drawState = DRAW_MODE.IDLE;

        this.bgCol = '#ffffff'; this.fgCol = '#000000';

        this.ppoint = { x: 0, y: 0 };
        this.cpoint = { x: 0, y: 0 };

        this.wrapper = document.getElementById(wrapperID);
        this.canvas = document.getElementById(canvasID);

        this.ctx = this.canvas.getContext('2d');
        this.reAdjustCanvas();

        this.config = {};
        this.config[TOOL_MODE.PEN] = { size: 2 };
        this.config[TOOL_MODE.ERASER] = { size: 20 };

        this.socket = io();
    }

    reAdjustCanvas() {
        this.canvas.width = this.wrapper.clientWidth;
        this.canvas.height = this.wrapper.clientHeight;
    }

    setTool(tool) { this.tool = tool; }
    setFGColor(col) { this.fgCol = col; }
    setPenSize(size) { this.config[TOOL_MODE.PEN].size = Math.min(25, Math.max(size, 2)); }

    clear(sock) {
        this.ctx.fillStyle = this.bgCol;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (sock) {
            // Emit event to socket
        }
    }

    genericRender(preconfig) {
        this.ctx.lineWidth = preconfig.lw; this.ctx.strokeStyle = preconfig.ss;
        this.ctx.lineCap = preconfig.lc; this.ctx.lineJoin = preconfig.lj;

        this.ctx.beginPath();
        this.ctx.moveTo(this.ppoint.x, this.ppoint.y);
        this.ctx.lineTo(this.cpoint.x, this.cpoint.y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    render() {
        this.genericRender({
            lw: this.config[this.tool].size,
            ss: this.tool === TOOL_MODE.PEN ? this.fgCol : this.bgCol,
            lc: 'round', lj: 'round'
        });

        // Emit event to socket
    }

    /* TODO */
    externalRender(data) {
        if (data.command === 'clear') this.clear(false);
        else genericRender(data.args);
    }

    mouseDown(e) {
        if (this.drawState === DRAW_MODE.IDLE || this.drawState === DRAW_MODE.PATH_END) {
            this.ppoint = { x: e.offsetX, y: e.offsetY };
            this.drawState = DRAW_MODE.PATH_BEGIN;
        }
    }

    mouseMove(e) {
        if (this.drawState === DRAW_MODE.PATH_BEGIN || this.drawState === DRAW_MODE.PATH_INSERT) {
            this.cpoint = { x: e.offsetX, y: e.offsetY };
            this.render();
            this.ppoint = this.cpoint;
            
            this.drawState = DRAW_MODE.PATH_INSERT;
        }
    }

    mouseUp(e) { this.mouseMove(e); this.drawState = DRAW_MODE.PATH_END; }

    mouseLeave(e) { this.mouseUp(e); }

    addMouseListener(event, fn) { this.canvas.addEventListener(event, fn, false); }
}

var canvasInit = () => {
    clrBox = document.querySelectorAll(".clr-box");
    clrBox.forEach(function (v) {
        v.addEventListener('click', () => {
            let aCbx = document.querySelectorAll(".clr-box.clr-box-active")[0];

            if (aCbx.classList.contains('clr-box-active'))
                aCbx.classList.toggle('clr-box-active');
            v.classList.toggle('clr-box-active');

            wboard.setFGColor(v.style.background);
        })
    });

    // Register tool events
    document.getElementById('tool-pen').addEventListener('click', () => {
        wboard.setTool(TOOL_MODE.PEN);
    });
    document.getElementById('tool-eraser').addEventListener('click', () => {
        wboard.setTool(TOOL_MODE.ERASER);
    });
    document.getElementById('tool-clear').addEventListener('click', () => {
        wboard.clear(true);
    });

    toolSize = document.getElementById('tool-size');

    toolSize.value = 2;
    toolSize.addEventListener('input', () => { wboard.setPenSize(toolSize.value); });

    wboard = new Whiteboard('wb-canvas-wrapper', 'wb-canvas');
    window.addEventListener('resize', wboard.reAdjustCanvas.bind(wboard), false);

    // Register mouse events
    wboard.addMouseListener('mousedown', wboard.mouseDown.bind(wboard));
    wboard.addMouseListener('mousemove', wboard.mouseMove.bind(wboard));
    wboard.addMouseListener('mouseup', wboard.mouseUp.bind(wboard));
    wboard.addMouseListener('mouseleave', wboard.mouseLeave.bind(wboard));
}

window.addEventListener('load', canvasInit, false);
