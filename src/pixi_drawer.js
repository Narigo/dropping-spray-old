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

  var renderer = PIXI.autoDetectRenderer(maxWidth, maxHeight, {view : canvas});
  renderer.backgroundColor = 0xFFFFFF;

  var stage = new PIXI.Container();
  stage.interactive = true;
  stage.hitArea = new PIXI.Rectangle(0, 0, maxWidth, maxHeight);

  return {
    drawShapes : drawShapes,
    clear : clearCanvas
  };

  function clearCanvas() {
    stage.clear();
  }

  function drawShapes(shapesToRender) {
    var color, i, shape, shapes;
    var graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    if (!shapesToRender.isEmpty()) {
      shapes = shapesToRender.shapes;
      color = shapesToRender.color.r * 255 * 255 + shapesToRender.color.g * 255 + shapesToRender.color.b;
      if (shapesToRender.shape === 'line') {
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          graphics.lineStyle(color, shape.size);
          graphics.drawCircle(shape.x0, shape.y0, shape.size);
          graphics.moveTo(shape.x0, shape.y0);
          graphics.lineTo(shape.x1, shape.y1);
          graphics.drawCircle(shape.x1, shape.y1, shape.size);
        }
      } else if (shapesToRender.shape === 'circle') {
        for (i = shapes.length - 1; i >= 0; i--) {
          shape = shapes[i];
          graphics.drawCircle(shape.x, shape.y, shape.radius);
        }
      }

      renderer.render(stage);
    }
  }

}

module.exports = PixiDrawer;
