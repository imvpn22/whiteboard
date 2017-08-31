var bgCanvas, bgCtx;

var renderBgGrid = (config) => {
	let xq = bgCanvas.width / config.xstep,
	yq = bgCanvas.height / config.ystep;

	// General config
	bgCtx.lineWidth = 1;
	bgCtx.strokeStyle = "rgba(0, 0, 0, 0.5)";

	for (var i = 1; i <= xq; i++) {
		bgCtx.beginPath();
		bgCtx.moveTo(i * config.xstep, 0);
		bgCtx.lineTo(i * config.xstep, bgCanvas.height);
		bgCtx.stroke();
	}

	for (var i = 1; i <= yq; i++) {
		bgCtx.beginPath();
		bgCtx.moveTo(0, i * config.ystep);
		bgCtx.lineTo(bgCanvas.width, i * config.ystep);
		bgCtx.stroke();
	}
}

window.addEventListener('load', () => {
	bgCanvas = document.getElementById("myCanvas");
	bgCtx = bgCanvas.getContext("2d");

	var config = { xstep: 100, ystep: 100 };
	var canvasResize = () => {
		bgCanvas.width = window.innerWidth;
		bgCanvas.height = window.innerHeight;
		renderBgGrid(config);
	}

	window.addEventListener('resize', canvasResize, false);
	canvasResize(); renderBgGrid(config);
}, false);

