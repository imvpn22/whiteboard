
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
        this.config[TOOL_MODE.PEN] = { size: 2, cursor: 'cursor-draw' };
        this.config[TOOL_MODE.ERASER] = { size: 20, cursor: 'cursor-erase' };
        this.config.throttle_delay = 10;
        this.resetCursor();

        this.socket = io();
        this.socket.on('clear', () => { this.clear(false); });
        this.socket.on('draw', (args) => { this.externalRender(args['data']); });
    }

    reAdjustCanvas() {
        this.canvas.width = this.wrapper.clientWidth;
        this.canvas.height = this.wrapper.clientHeight;
    }

    /* Must be called after tool is updated */
    resetCursor() {
        let cKlass = this.tool === TOOL_MODE.PEN ?
                     this.config[TOOL_MODE.ERASER].cursor :
                     this.config[TOOL_MODE.PEN].cursor;

        this.canvas.classList.remove(cKlass);
        this.canvas.classList.add(this.config[this.tool].cursor);
    }

    setTool(tool) { this.tool = tool; this.resetCursor(); }
    setFGColor(col) { this.fgCol = col; }
    setPenSize(size) { this.config[TOOL_MODE.PEN].size = Math.min(25, Math.max(size, 2)); }

    clear(sock = true) {
        this.ctx.fillStyle = this.bgCol;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (sock) this.socket.emit('clear');
    }

    genericRender(config, line) {
        this.ctx.lineWidth = config.lw; this.ctx.strokeStyle = config.ss;
        this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(line.x0, line.y0);
        this.ctx.lineTo(line.x1, line.y1);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    render() {
        let conf = {
            lw: this.config[this.tool].size,
            ss: this.tool === TOOL_MODE.PEN ? this.fgCol : this.bgCol
        }
        let line = {
            x0: this.ppoint.x, y0: this.ppoint.y,
            x1: this.cpoint.x, y1: this.cpoint.y
        }

        this.genericRender(conf, line);

        // Normalize line data for export
        Object.keys(line).map((k, i) => {
            line[k] /= (i & 1) === 0 ? this.canvas.width : this.canvas.height;
        });
        // Emit data to server
        this.socket.emit('draw-data', { 'conf': conf, 'line': line });
    }

    externalRender(data) {
        // Scale normalized line data
        let line = data['line'];
        Object.keys(line).map((k, i) => {
            line[k] *= (i & 1) === 0 ? this.canvas.width : this.canvas.height;
        });
        // Render data
        this.genericRender(data['conf'], line);
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
    wboard.addMouseListener('mouseup', wboard.mouseUp.bind(wboard));
    wboard.addMouseListener('mouseleave', wboard.mouseLeave.bind(wboard));
    
    // Throttle draw calls for performance
    wboard.addMouseListener('mousemove', (() => {
        var epoch = Date.now();
        return function() {
            let t = Date.now();
            if ((t - epoch) >= wboard.config.throttle_delay) {
                epoch = t;
                wboard.mouseMove.apply(wboard, arguments);
            }
        };
    })());
}

window.addEventListener('load', canvasInit, false);
