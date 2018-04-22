(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function CanvasDrawer(canvas) {
  var ctx = canvas.getContext('2d');

  return {
    drawShapes : drawShapes,
    clear : clearCanvas
  };

  function clearCanvas() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function drawShapes(shapesToRender) {
    var colorString, i, shape, shapes;
    if (!shapesToRender.isEmpty()) {
      shapes = shapesToRender.shapes;
      colorString = getRgbString(shapesToRender.color.r, shapesToRender.color.g, shapesToRender.color.b);
      ctx.fillStyle = colorString;
      if (shapesToRender.shape === 'line') {
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          ctx.strokeStyle = colorString;
          ctx.lineCap = 'round';
          ctx.lineWidth = shape.size;
          linePath(shape.x0, shape.y0, shape.x1, shape.y1);
        }
        ctx.stroke();
      } else if (shapesToRender.shape === 'circle') {
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          ctx.beginPath();
          circlePath(shape.x, shape.y, shape.radius);
          ctx.fill();
        }
      }
    }
  }

  function linePath(x0, y0, x1, y1) {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }

  function circlePath(x, y, radius) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  }
}

function getRgbString(red, green, blue) {
  var rgb = 'rgb(';
  rgb += red;
  rgb += ',';
  rgb += green;
  rgb += ',';
  rgb += blue;
  rgb += ')';
  return rgb;
}

module.exports = CanvasDrawer;

},{}],2:[function(require,module,exports){
function Circles(red, green, blue) {
  var that = this;
  this.shape = 'circle';
  this.color = {
    r : red,
    g : green,
    b : blue
  };
  this.shapes = [];
  this.isEmpty = function () {
    return that.shapes.length === 0;
  };
}

function Lines(red, green, blue) {
  var that = this;
  this.shape = 'line';
  this.color = {
    r : red,
    g : green,
    b : blue
  };
  this.shapes = [];
  this.isEmpty = function () {
    return that.shapes.length === 0;
  };
}

function circle(x, y, radius) {
  return {
    x : x,
    y : y,
    radius : radius
  };
}

function line(x0, y0, x1, y1, size) {
  return {
    size : size,
    x0 : x0,
    y0 : y0,
    x1 : x1,
    y1 : y1
  };
}

module.exports = {
  circle : circle,
  line : line,
  Circles : Circles,
  Lines : Lines
};

},{}],3:[function(require,module,exports){
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

},{"./canvas_drawer.js":1,"./options.js":4,"./spray.js":5}],4:[function(require,module,exports){
module.exports = function (optionDomId, canvas, drawer, createSpray, resetSpray, autoSprays, triggerRender) {

  var form = document.getElementById(optionDomId);

  function getOptions() {
    var r = fieldBetween(form.red, 0, 255);
    var g = fieldBetween(form.green, 0, 255);
    var b = fieldBetween(form.blue, 0, 255);

    return {
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

    function fieldBetween(field, min, max) {
      var value = Math.max(min, Math.min(max, parseInt(field.value)));
      field.value = value;
      return value;
    }
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
      [].forEach.call(autoSprays, function (autoSpray) {
        autoSpray.spray.stopDrops();
        autoSpray.spray.resetDrops();
      });
      drawer.clear();
    });

    document.getElementById('autoSprayStop').addEventListener('click', function () {
      [].forEach.call(autoSprays, function (autoSpray) {
        autoSpray.spray.stopDrops();
      });
      autoSprays = [];
    });

    document.getElementById('randomColor').addEventListener('click', function () {
      randomizeColor();
      resetSpray();
    });

    document.getElementById('autoSpray').addEventListener('click', function () {
      var speed = autoSpraySpeed;
      var autoSprayCoords = {
        x : 0,
        y : Math.floor(Math.random() * canvas.height)
      };
      var autoSpray = {
        draw : sprayFromLeftToRight,
        spray : createSpray()
      };
      autoSprays.push(autoSpray);
      triggerRender();

      function sprayFromLeftToRight(drawer) {
        autoSprayCoords.x = autoSprayCoords.x + Math.round(Math.random() * Math.max(0, speed));
        autoSprayCoords.y =
          Math.max(0, Math.min(canvas.height - 1, (autoSprayCoords.y + Math.floor(Math.random() * 3) - 1)));
        if (autoSprayCoords.x < canvas.width) {
          autoSpray.spray.draw(drawer, autoSprayCoords);
          return true;
        } else {
          autoSprays.splice(autoSprays.indexOf(autoSpray), 1);
          return false;
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

  return {
    getOptions : getOptions,
    setupOptions : setupOptions,
    setupForm : setupForm
  };
};

},{}],5:[function(require,module,exports){
var DrawShapes = require('./draw_shapes.js');
var defaultOptions = {
  color : {
    r : 0,
    g : 0,
    b : 255
  },
  size : 5,

  splatterAmount : 10,
  splatterRadius : 20,

  dropper : true,
  dropThreshold : 50,
  dropSpeed : 3
};

function Spray(options) {
  var opts = options || defaultOptions;
  var color = getOpt('color');
  var size = getOpt('size');
  var splatterAmount = getOpt('splatterAmount');
  var splatterRadius = getOpt('splatterRadius');
  var dropper = getOpt('dropper');
  var dropThreshold = getOpt('dropThreshold');
  var dropSpeed = getOpt('dropSpeed');
  var canvas = opts.canvas;
  var dropFns = [];
  var drops = [];

  initializeDropCounter();

  return {
    draw : draw,
    resetDrops : initializeDropCounter,
    stopDrops : stopCurrentDrops
  };

  function getOpt(name) {
    var opt = opts[name];
    if (typeof opt !== 'undefined') {
      return opt;
    } else {
      return defaultOptions[name];
    }
  }

  function draw(drawer, sprayCoords) {
    var al, amount, sprayedCircles, dropLines;
    var spraying = !!sprayCoords;
    var isDropping = false;

    if (spraying) {
      sprayedCircles = sprayAt(sprayCoords.x, sprayCoords.y);
    }

    al = getDrops();
    amount = al.amount;
    dropLines = al.lines;

    if (sprayedCircles && !sprayedCircles.isEmpty()) {
      isDropping = true;
      drawer.drawShapes(sprayedCircles);
    }

    if (dropLines && !dropLines.isEmpty() || amount > 0) {
      isDropping = true;
      drawer.drawShapes(dropLines);
    }

    return isDropping || spraying;
  }

  function getDrops() {
    var dropLines = new DrawShapes.Lines(color.r, color.g, color.b);

    if (dropper) {
      var amount = dropFns.length;
      for (var i = amount - 1; i >= 0; i--) {
        dropFns[i](i, dropLines.shapes);
      }
    }

    return {
      amount : amount,
      lines : dropLines
    };
  }

  function stopCurrentDrops() {
    dropFns = [];
  }

  function initializeDropCounter() {
    for (var x = 0; x < canvas.width / size; x++) {
      drops[x] = [];
      for (var y = 0; y < canvas.height / size; y++) {
        drops[x][y] = {
          count : 0,
          drops : false,
          width : 0,
          dropSpeed : dropSpeed
        };
      }
    }
  }

  function filledCircle(circleShapes, x, y, radius) {
    circleShapes.push(DrawShapes.circle(x, y, radius));
  }

  function dropAt(x, y, initialDrop) {
    var maxY = drops[x].length - 1;

    dropFns.push(createDropFnFor(maxY, x, y, initialDrop));
  }

  function createDropFnFor(maxY, x, y, myDrop) {
    return function (idx, shapesArray) {
      var deltaWidth, deltaX, nextY, otherDrop;

      if (myDrop.count <= 0) {
        myDrop.count = 0;
        dropFns.splice(idx, 1);
      } else if (y < maxY) {
        myDrop.dropSpeed = Math.max(1, myDrop.dropSpeed - myDrop.width);

        if (myDrop.dropSpeed === 1) {
          deltaWidth = Math.floor(Math.random() * 3) - 1;
          deltaX = Math.floor(Math.random() * 3) - 1;

          // drop next step
          nextY = y + 1;
          otherDrop = drops[x][nextY];
          if (!otherDrop.drops) {
            otherDrop.drops = true;
            myDrop.count = myDrop.count - myDrop.width;
          }
          otherDrop.count += myDrop.count;
          otherDrop.width = Math.max(Math.max(1, myDrop.width + deltaWidth), otherDrop.width);
          shapesArray.push(DrawShapes.line(x * size, y * size, (x * size) + deltaX, nextY * size, myDrop.width));

          myDrop.count = 0;
          myDrop = otherDrop;
          y = nextY;
        } else {
          myDrop.count = myDrop.count + size;
        }

        dropFns.splice(idx, 1, createDropFnFor(maxY, x, y, myDrop));
      }
    };
  }

  function sprayAt(x, y) {
    var xArea = Math.max(0, Math.floor(Math.min(canvas.width - 1, x) / size));
    var yArea = Math.max(0, Math.floor(Math.min(canvas.height - 1, y) / size));
    var drop = drops[xArea][yArea];
    if (dropper) {
      drop.count += size;
      if (drop.count >= dropThreshold) {
        drop.drops = true;
        drop.width = size;
        dropAt(xArea, yArea, drop);
      }
    }
    var circles = new DrawShapes.Circles(color.r, color.g, color.b);
    filledCircle(circles.shapes, x, y, size);
    drawCirclesAround(circles.shapes, x, y);
    return circles;
  }

  function drawCirclesAround(circleShapes, x, y) {
    var dx, dy, r, s, t;
    for (var i = splatterAmount; i > 0; i--) {
      t = Math.random() * 2 * Math.PI;
      r = Math.random();
      dx = r * Math.cos(t) * splatterRadius;
      dy = r * Math.sin(t) * splatterRadius;
      s = 1 - (Math.sqrt(dx * dx + dy * dy) / splatterRadius);
      filledCircle(circleShapes, x + dx, y + dy, size * s);
    }
  }
}


module.exports = Spray;

},{"./draw_shapes.js":2}]},{},[3]);
