var PIXI = require('pixi.js');

function PixiDrawer(canvas) {
  var resolution = (function () {
    var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight;

    return [x, y];
  }());

  var maxWidth = resolution[0] * 2;
  var maxHeight = resolution[1] * 2;
  canvas.width = maxWidth;
  canvas.height = maxHeight;

  console.log(maxWidth, maxHeight, canvas);
  var renderer = PIXI.autoDetectRenderer(maxWidth, maxHeight, {view : canvas, antialias : true});
  renderer.backgroundColor = 0xFF00FF;

  var stage = new PIXI.Container();

  var graphics = new PIXI.Graphics();
  stage.addChild(graphics);
  renderer.render(stage);

  return {
    drawShapes : drawShapes,
    clear : clearCanvas
  };

  function clearCanvas() {
    graphics.clear();
    renderer.render(stage);
  }

  function drawShapes(shapesToRender) {
    var color, i, shape, shapes, size, x, y;

    if (!shapesToRender.isEmpty()) {
      shapes = shapesToRender.shapes;
      color = shapesToRender.color.r * 255 * 255 + shapesToRender.color.g * 255 + shapesToRender.color.b;
      if (shapesToRender.shape === 'line') {
        console.log('drawing ', shapes.length, ' lines in', color, '.');
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          graphics.lineStyle(shape.size, color, 1);
          graphics.drawCircle(shape.x0, shape.y0, shape.size);
          graphics.moveTo(shape.x0, shape.y0);
          graphics.lineTo(shape.x1, shape.y1);
          graphics.drawCircle(shape.x1, shape.y1, shape.size);
        }
      } else if (shapesToRender.shape === 'circle') {
        console.log('drawing ', shapes.length, ' circles in', color, '.');
        graphics.beginFill(color, 1);
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          x = Math.round(shape.x);
          y = Math.round(shape.y);
          size = Math.max(1, Math.round(shape.radius));
          graphics.moveTo(x, y);
          console.log('drawing ', x, y, size);
          graphics.drawCircle(x, y, size);
        }
        graphics.endFill();
      }

      renderer.render(stage);
    }
  }

}

module.exports = PixiDrawer;
