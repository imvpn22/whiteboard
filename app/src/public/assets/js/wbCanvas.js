
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
        this.socket.on('clear', () => { this.clear(false); });
    }

    reAdjustCanvas() {
        this.canvas.width = this.wrapper.clientWidth;
        this.canvas.height = this.wrapper.clientHeight;
    }

    setTool(tool) { this.tool = tool; }
    setFGColor(col) { this.fgCol = col; }
    setPenSize(size) { this.config[TOOL_MODE.PEN].size = Math.min(25, Math.max(size, 2)); }

    clear(sock = true) {
        this.ctx.fillStyle = this.bgCol;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (sock) this.socket.emit('clear');
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
        // if (data.command === 'clear') this.clear(false);
        // else genericRender(data.args);
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
    let groupExSelect = (obj, groupSelector, activeKlass) => {
        let act = document.querySelectorAll('.' + groupSelector + '.' + activeKlass)[0];

        if (act.classList.contains(activeKlass))
            act.classList.toggle(activeKlass);
        obj.classList.toggle(activeKlass);
    }

    clrBox = document.querySelectorAll('.clr-box');
    clrBox.forEach(function (v) {
        v.addEventListener('click', () => {
            groupExSelect(v, 'clr-box', 'clr-box-active');
            wboard.setFGColor(v.style.background);
        });
    });

    // Register tool events
    document.getElementById('tool-clear').addEventListener('click', () => {
        wboard.clear(true);
    });

    const tmap = { 'tool-pen': TOOL_MODE.PEN, 'tool-eraser': TOOL_MODE.ERASER };
    ['tool-pen', 'tool-eraser'].map((id) => {
        let obj = document.getElementById(id);
        obj.addEventListener('click', () => {
            groupExSelect(obj, 'tool-item', 'tool-item-active');
            wboard.setTool(tmap[id]);
        });
    });

    // Tool size
    toolSize = document.getElementById('tool-size');
    toolSize.value = 2;
    toolSize.addEventListener('input', () => { wboard.setPenSize(toolSize.value); });

    // Whiteboard
    wboard = new Whiteboard('wb-canvas-wrapper', 'wb-canvas');
    window.addEventListener('resize', wboard.reAdjustCanvas.bind(wboard), false);

    // Register mouse events
    wboard.addMouseListener('mousedown', wboard.mouseDown.bind(wboard));
    wboard.addMouseListener('mousemove', wboard.mouseMove.bind(wboard));
    wboard.addMouseListener('mouseup', wboard.mouseUp.bind(wboard));
    wboard.addMouseListener('mouseleave', wboard.mouseLeave.bind(wboard));
}

window.addEventListener('load', canvasInit, false);
