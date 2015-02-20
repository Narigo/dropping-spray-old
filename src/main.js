var Spray = require('./spray.js');
var CanvasDrawer = require('./canvas_drawer.js');

var canvas = document.getElementById('spray1');
var drawer = new CanvasDrawer(canvas);

var spray;
var spraying = false;

var mouseX = 0;
var mouseY = 0;
var requestsAnimFrame = false;

var startEventCanvas = downEvent(canvas, function () {
  spraying = true;
  requestsAnimFrame = true;
  render();
});
var moveEventCanvas = downEvent(canvas);

var form = document.getElementById('options');

canvas.height = document.getElementById('spray1').offsetHeight;
canvas.width = window.innerWidth;

canvas.addEventListener('mousedown', startEventCanvas);
canvas.addEventListener('mousemove', moveEventCanvas);
canvas.addEventListener('touchstart', startEventCanvas);
canvas.addEventListener('touchmove', moveEventCanvas);

document.addEventListener('mouseup', stopSpraying);
document.addEventListener('touchend', stopSpraying);

setupOptions();
setupForm();

resetSpray();

// Functions
function resetSpray() {
  spray = createSpray();
}

function createSpray() {
  var r = fieldBetween(form.red, 0, 255);
  var g = fieldBetween(form.green, 0, 255);
  var b = fieldBetween(form.blue, 0, 255);
  var options = {
    color : {
      r : r,
      g : g,
      b : b
    },
    canvas : canvas,
    size : fieldBetween(form.size, 1, Math.min(canvas.height, canvas.width)),
    splatterAmount : fieldBetween(form.splatterAmount, 0, Infinity),
    splatterRadius : fieldBetween(form.splatterRadius, 0, Infinity),
    dropper : !!form.drops.checked,
    dropThreshold : fieldBetween(form.dropThreshold, 0, Infinity),
    dropSpeed : fieldBetween(form.dropSpeed, 0, Infinity)
  };

  return new Spray(options);

  function fieldBetween(field, min, max) {
    var value = Math.max(min, Math.min(max, parseInt(field.value)));
    field.value = value;
    return value;
  }
}

function stopSpraying() {
  spraying = false;
  spray.resetDrops();
}

function render() {
  var sprayedCircles, dropLines;
  var requestsAnimFrame = false;
  if (spraying) {
    sprayedCircles = spray.sprayAt(mouseX, mouseY);
  }
  var al = spray.getDrops();
  var amount = al.amount;
  dropLines = al.lines;

  if (sprayedCircles && !sprayedCircles.isEmpty()) {
    requestsAnimFrame = true;
    drawer.drawShapes(sprayedCircles);
  }

  if (dropLines && !dropLines.isEmpty() || amount > 0) {
    requestsAnimFrame = true;
    drawer.drawShapes(dropLines);
  }

  requestsAnimFrame = requestsAnimFrame || spraying;

  if (requestsAnimFrame) {
    requestAnimationFrame(render);
  }
}

function downEvent(canvas, cb) {
  return function (event) {
    event.preventDefault();
    event.stopPropagation();
    var touchList = event.touches;
    if (touchList) {
      var touch = touchList[0];
      mouseX = parseInt(touch.pageX) - canvas.offsetLeft;
      mouseY = parseInt(touch.pageY) - canvas.offsetTop;
    } else {
      mouseX = event.pageX - canvas.offsetLeft;
      mouseY = event.pageY - canvas.offsetTop;
    }
    if (cb) {
      cb();
    }
  };
}

function setupOptions() {

  var hider = document.getElementById('options-hider');
  var options = document.getElementById('options-content');

  hider.addEventListener('click', toggleOptions);

  var isHidden = false;

  function toggleOptions() {
    isHidden = !isHidden;
    if (isHidden) {
      options.style.display = 'none';
      hider.innerHTML = 'Open options';
      hider.classList.add('open');
    } else {
      options.style.display = 'block';
      hider.innerHTML = 'close';
      hider.classList.remove('open');
    }
  }

}

function setupForm() {
  var autoSpraySpeed = parseInt(form.autoSpraySpeed.value);

  form.red.addEventListener('change', resetSpray);
  form.green.addEventListener('change', resetSpray);
  form.blue.addEventListener('change', resetSpray);
  form.size.addEventListener('change', resetSpray);
  form.splatterAmount.addEventListener('change', resetSpray);
  form.splatterRadius.addEventListener('change', resetSpray);
  form.drops.addEventListener('change', resetSpray);
  form.dropThreshold.addEventListener('change', resetSpray);
  form.dropSpeed.addEventListener('change', resetSpray);
  form.autoSpraySpeed.addEventListener('change', function () {
    autoSpraySpeed = parseInt(form.autoSpraySpeed.value);
  });

  document.getElementById('clearCanvas').addEventListener('click', function () {
    resetSpray();
    drawer.clear();
  });

  document.getElementById('randomColor').addEventListener('click', function () {
    randomizeColor();
    resetSpray();
  });
  document.getElementById('autoSpray').addEventListener('click', function () {
    resetSpray();
    var x = 0;
    var y = Math.floor(Math.random() * canvas.height);

    sprayFromLeftToRight();

    function sprayFromLeftToRight() {
      x = x + Math.round(Math.random() * Math.max(0, autoSpraySpeed));
      y = Math.max(0, Math.min(canvas.height - 1, (y + Math.floor(Math.random() * 3) - 1)));
      if (x < canvas.width) {
        drawer.drawShapes(spray.sprayAt(x, y));
        drawer.drawShapes(spray.getDrops().lines);
        requestAnimationFrame(sprayFromLeftToRight);
      } else {
        console.log('auto spray done');
      }
    }
  });

  function randomizeColor() {
    form.red.value = Math.round(Math.random() * 255);
    form.green.value = Math.round(Math.random() * 255);
    form.blue.value = Math.round(Math.random() * 255);
  }

  randomizeColor();
}