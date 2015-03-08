describe('Spray', function () {

  var Spray = require('../src/spray.js');
  var splatterAmount = 33;
  var dropThreshold = 5;
  var spraySize = 1;

  var canvas = {
    width : 1000,
    height : 1000
  };
  var spray = new Spray({
    size: spraySize,
    splatterAmount : splatterAmount,
    dropThreshold : dropThreshold,
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

  it('should draw the same amount of circles as put into options plus one (the one in the middle)', function () {
    spray.draw(DrawerMock, {x : 500, y : 500});
    expect(DrawerMock.amountOfCircles()).toBe(splatterAmount + 1);
  });

  it('should always draw the amount of circles as put into options when we repeatedly spray', function () {
    var howOften = 5;
    var i;
    for (i = 0; i < howOften; i++) {
      spray.draw(DrawerMock, {x : 500, y : 500});
    }

    expect(DrawerMock.amountOfCircles()).toBe((splatterAmount + 1) * howOften);
  });

  it('should start dropping when hitting the threshold and thus draw a line', function () {
    var mySpray = new Spray({
      size : spraySize,
      splatterAmount : 0,
      splatterRadius : 0,
      dropThreshold : dropThreshold,
      canvas : canvas
    });

    var i;
    for (i = 0; i <= dropThreshold / spraySize; i++) {
      mySpray.draw(DrawerMock, {x : 500, y : 500});
    }
    expect(DrawerMock.amountOfLines()).toBe(1);
  });

});
