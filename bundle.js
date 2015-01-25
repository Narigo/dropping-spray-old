(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Spray = require('./spray.js');

var canvas = document.getElementById('spray1');
var s1 = new Spray({
  color : 'rgb(0, 255, 0)',
  size : 5,
  canvas : canvas
});
var spraying = false;
var mouseX = 0;
var mouseY = 0;

function render() {
  if (spraying) {
    s1.sprayAt(mouseX, mouseY);
  }
  s1.renderDrops();

  requestAnimationFrame(render);
}
render();

canvas.addEventListener('mousedown', function (event) {
  event.preventDefault();
  event.stopPropagation();
  spraying = true;
  mouseX = event.clientX - canvas.offsetLeft;
  mouseY = event.clientY - canvas.offsetTop;
});

canvas.addEventListener('mousemove', function (event) {
  mouseX = event.clientX - canvas.offsetLeft;
  mouseY = event.clientY - canvas.offsetTop;
});

document.addEventListener('mouseup', function (event) {
  spraying = false;
});

},{"./spray.js":2}],2:[function(require,module,exports){
var defaultOptions = {
  color : 'rgb(0, 0, 255)',
  size : 5,

  splatterAmount : 10,
  splatterRadius : 20,

  dropper : true,
  dropThreshold : 50,
  dropSpeed : 10
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
  var canvas = opts.canvas || document.getElementsById('spray1');
  var dropFns = [];
  var drops = [];
  var ctx = canvas.getContext('2d');

  initializeDropCounter();

  return {
    sprayAt : sprayAt,
    renderDrops : renderDrops
  };

  function getOpt(name) {
    return opts[name] || defaultOptions[name];
  }

  function renderDrops() {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    for (var i = dropFns.length - 1; i >= 0; i--) {
      dropFns[i](i);
    }
    ctx.stroke();
    ctx.fill();
    ctx.restore();
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

  function filledCircle(x, y, radius) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  }

  function dropAt(x, y, initialDrop) {
    var maxY = drops[x].length - 1;
    var myDrop = initialDrop;

    dropFn();

    function dropFn(idx) {
      var deltaWidth, deltaX, otherDrop;

      myDrop.count = myDrop.count - 1;

      if (myDrop.count <= 0) {
        drops[x][y] = {
          count : 0,
          drops : false
        };
        if (typeof idx !== 'undefined') {
          dropFns.splice(idx, 1);
        }
      } else if (y < maxY) {
        myDrop.dropSpeed = Math.max(1, myDrop.dropSpeed - 1);

        if (myDrop.dropSpeed === 1) {
          deltaWidth = Math.floor(Math.random() * 3) - 1;
          deltaX = Math.floor(Math.random() * 3) - 1;

          // drop next step
          ctx.lineWidth = myDrop.width;
          ctx.moveTo(x * size, y * size);

          y = y + 1;
          otherDrop = drops[x][y];
          otherDrop.count += myDrop.count;
          otherDrop.drops = true;
          otherDrop.width = Math.max(Math.max(1, myDrop.width + deltaWidth), otherDrop.width);
          ctx.lineTo((x * size) + deltaX, y * size);

          myDrop.count = 0;
          myDrop.drops = false;
          myDrop = otherDrop;
        } else {
          myDrop.count = myDrop.count + size;
        }

        dropFns.push(dropFn);
      }
    }
  }

  function sprayAt(x, y) {
    var xArea = Math.floor(x / size);
    var yArea = Math.floor(y / size);
    var drop = drops[xArea][yArea];
    if (dropper) {
      drop.count += size;
      if (drop.count > dropThreshold && !drop.drops) {
        drop.drops = true;
        drop.width = Math.round(Math.random() * size);
        dropAt(xArea, yArea, drop);
      }
    }
    ctx.save();
    ctx.fillStyle = color;
    filledCircle(x, y, size);
    drawCirclesAround(x, y);
    ctx.restore();
  }

  function drawCirclesAround(x, y) {
    var dx, dy, r, s, t;
    for (var i = splatterAmount; i > 0; i--) {
      ctx.beginPath();
      t = Math.random() * 2 * Math.PI;
      r = Math.random();
      dx = r * Math.cos(t) * splatterRadius;
      dy = r * Math.sin(t) * splatterRadius;
      s = 1 - (Math.sqrt(dx * dx + dy * dy) / splatterRadius);
      filledCircle(x + dx, y + dy, size * s);
      ctx.fill();
    }
  }
}


module.exports = Spray;

},{}]},{},[1]);
