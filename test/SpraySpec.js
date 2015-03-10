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
    size : spraySize,
    splatterAmount : splatterAmount,
    dropThreshold : dropThreshold,
    canvas : canvas
  });
  var DrawerMock;

  beforeEach(function () {
    DrawerMock = (function () {
      var circles = 0;
      var lines = 0;
      var maxLineSize = 0;
      return {
        drawShapes : function (shapes) {
          if (shapes.shape === 'circle') {
            circles += shapes.shapes.length;
          } else if (shapes.shape === 'line') {
            lines += shapes.shapes.length;
            for (var i = 0; i < shapes.shapes.length; i++) {
              maxLineSize = Math.max(maxLineSize, shapes.shapes[i].size);
            }
          }
        },
        amountOfCircles : function () {
          return circles;
        },
        amountOfLines : function () {
          return lines;
        },
        maxSizeOfLines : function () {
          return maxLineSize;
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
    for (i = 0; i < (dropThreshold / spraySize) + 1; i++) {
      mySpray.draw(DrawerMock, {x : 500, y : 500});
    }
    expect(DrawerMock.amountOfLines()).toBe(1);
  });

  it('should not draw lines that are bigger than the drop threshold (the amount of spray needed to drop)', function () {
    var i;
    for (i = 0; i <= dropThreshold / spraySize; i++) {
      spray.draw(DrawerMock, {x : 500, y : 500});
    }
    expect(DrawerMock.maxSizeOfLines() <= dropThreshold);
  });

  it('should draw multiple lines after hitting the drop threshold', function () {
    var i;
    for (i = 0; i <= dropThreshold / spraySize; i++) {
      spray.draw(DrawerMock, {x : 500, y : 500});
    }
    expect(DrawerMock.amountOfLines() >= 1).toBeTruthy();
  });

  it('should draw without problems at the edge cases', function () {
    var i = 0;
    spray.draw(DrawerMock, {x : 0, y : 0});
    i++;
    spray.draw(DrawerMock, {x : 0, y : 500});
    i++;
    spray.draw(DrawerMock, {x : 0, y : 1000});
    i++;
    spray.draw(DrawerMock, {x : 500, y : 1000});
    i++;
    spray.draw(DrawerMock, {x : 500, y : 0});
    i++;
    spray.draw(DrawerMock, {x : 1000, y : 0});
    i++;
    spray.draw(DrawerMock, {x : 1000, y : 500});
    i++;
    spray.draw(DrawerMock, {x : 1000, y : 1000});
    i++;

    expect(DrawerMock.amountOfCircles()).toBe((splatterAmount + 1) * i);
  });
});
