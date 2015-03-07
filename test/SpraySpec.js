describe('Spray', function () {

  var Spray = require('../src/spray.js');
  var splatterAmount = 33;
  var canvas = {
    width: 100,
    height: 100
  };
  var spray = new Spray({
    splatterAmount : splatterAmount,
    canvas : canvas
  });
  var DrawerMock;

  beforeEach(function () {
    DrawerMock = (function () {
      var circles = 0;
      var lines = 0;
      return {
        drawShapes : function (shapes) {
          if (shapes.shape === 'circle') {
            circles += shapes.shapes.length;
          } else if (shapes.shape === 'line') {
            lines += shapes.shapes.length;
          }
        },
        amountOfCircles : function () {
          return circles;
        },
        amountOfLines : function () {
          return lines;
        }
      };
    }());
  });

  it('should draw the same amount of circles as put into options', function () {
    spray.draw(DrawerMock, {x : 50, y : 50});
    expect(DrawerMock.amountOfCircles()).toBe(splatterAmount + 1);
  });

});
