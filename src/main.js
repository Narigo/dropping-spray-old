var Spray = require('./spray.js');
//var CanvasDrawer = require('./canvas_drawer.js');
var PixiDrawer = require('./canvas_drawer.js');

var canvas = document.getElementById('spray1');
//var drawer = new CanvasDrawer(canvas);
var drawer = new PixiDrawer(canvas);


var spray;
var spraying = false;
var autoSprays = [];

var sprayCoords = {
  x : 0,
  y : 0
};
var requestingAnimationFrame = false;

var startEventCanvas = downEvent(canvas, function () {
  spraying = true;
  if (!requestingAnimationFrame) {
    render();
  }
});
var moveEventCanvas = downEvent(canvas);

var options = require('./options.js')('options', canvas, drawer, createSpray, resetSpray, autoSprays, triggerRender);

window.addEventListener('resize', resize);
resize();

canvas.addEventListener('mousedown', startEventCanvas);
canvas.addEventListener('mousemove', moveEventCanvas);
canvas.addEventListener('touchstart', startEventCanvas);
canvas.addEventListener('touchmove', moveEventCanvas);

document.addEventListener('mouseup', stopSpraying);
document.addEventListener('touchend', stopSpraying);

options.setupOptions();
options.setupForm();

resetSpray();

// Functions
function resetSpray() {
  spray = createSpray();
}

function createSpray() {
  var opts = options.getOptions();

  return new Spray(opts);
}

function stopSpraying() {
  spraying = false;
  spray.resetDrops();
}

function triggerRender() {
  if (!requestingAnimationFrame) {
    render();
  }
}

function render() {
  var isDrawing;
  if (spraying) {
    isDrawing = spray.draw(drawer, sprayCoords);
  } else {
    isDrawing = spray.draw(drawer);
  }

  for (var i = autoSprays.length - 1; i >= 0; i--) {
    isDrawing = autoSprays[i].draw(drawer) || isDrawing;
  }

  if (isDrawing) {
    requestingAnimationFrame = true;
    requestAnimationFrame(render);
  } else {
    requestingAnimationFrame = false;
  }
}

function downEvent(canvas, cb) {
  return function (event) {
    event.preventDefault();
    event.stopPropagation();
    var touchList = event.touches;
    if (touchList) {
      var touch = touchList[0];
      sprayCoords.x = parseInt(touch.pageX) - canvas.offsetLeft;
      sprayCoords.y = parseInt(touch.pageY) - canvas.offsetTop;
    } else {
      sprayCoords.x = event.pageX - canvas.offsetLeft;
      sprayCoords.y = event.pageY - canvas.offsetTop;
    }
    if (cb) {
      cb();
    }
  };
}

function resize() {
  canvas.height = document.getElementById('spray1').offsetHeight;
  canvas.width = window.innerWidth;
}
