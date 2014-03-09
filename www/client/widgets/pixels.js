
Pixels = function(options) {

  var colors = options.colors;
  var pixelWalkStart = { x: 50, y: 250 };
  var canvasMid = { x: 250, y: 250 };
  var numBoxes = 125;
  var R = 10;

  var elem = $('#pixels');

  function planarRandomWalk(x, y, stepMagnitude, num) {
    var t = Math.PI / 4;
    var maxDeltaT = .45;
    return genArray(
        { x: x, y: y },
        function(prevElem) {
          var tv = maxDeltaT * (Math.random() * 2 - 1);
          t += tv;
          return {
            x: prevElem.x + stepMagnitude * Math.cos(t),
            y: prevElem.y + stepMagnitude * Math.sin(t)
          }
        },
        num
    );
  }

  function addPixels() {

    elem.height($(window).height() - elem.offset().top - 20);

    d('#pixels')
        .selectAll('circle.pixel')
        .data(copies(1, numBoxes))
        .enter()
        .append('circle')
        .attr('class', 'pixel')
        .attr("r", R)
  }

  function setCoords(coords) {
    var minPoint = {
      x: minBy(coords, acc('x')).x,
      y: minBy(coords, acc('y')).y
    };
    var maxPoint = {
      x: maxBy(coords, acc('x')).x,
      y: maxBy(coords, acc('y')).y
    };

    var pointsWidth = maxPoint.x - minPoint.x;
    var pointsHeight = maxPoint.y - minPoint.y;

    var minScreen = { x: 2*R, y: 2*R };
    var maxScreen = { x: width() - 2*R, y: height() - 2*R };

    var screenWidth = maxScreen.x - minScreen.x;
    var screenHeight = maxScreen.y - minScreen.y;

    var projectedScreenWidth = null, projectedScreenHeight = null, xSlush = 0, ySlush = 0;
    if (pointsWidth * screenHeight > screenWidth * pointsHeight) {
      projectedScreenWidth = screenWidth;
      projectedScreenHeight = pointsHeight * screenWidth / pointsWidth;
      ySlush = (screenHeight - projectedScreenHeight) / 2;
    } else {
      projectedScreenWidth = pointsWidth * screenHeight / pointsHeight;
      projectedScreenHeight = screenHeight;
      xSlush = (screenWidth - projectedScreenWidth) / 2;
    }

    var scaleFactor = min(projectedScreenWidth / pointsWidth, projectedScreenHeight / pointsHeight);

    d('#pixels')
        .selectAll('circle.pixel')
        .data(coords.map(function(coord) {
          return {
            x: interpolate(coord.x, minPoint.x, maxPoint.x, minScreen.x + xSlush, minScreen.x + xSlush + projectedScreenWidth),
            y: interpolate(coord.y, minPoint.y, maxPoint.y, minScreen.y + ySlush, minScreen.y + ySlush + projectedScreenHeight)
          }
        }))
        .transition()
        .duration(1000)
        .attr('cx', function(d) {
          return Math.floor(d.x);
        })
        .attr('cy', function(d) {
          return Math.floor(d.y);
        })
        .attr('r', R*scaleFactor)
    ;
  }

  function width() {
    return parseInt(elem.css('width'));
  }

  function height() {
    return parseInt(elem.css('height'));
  }

  function midX() {
    return width() / 2;
  }

  function midY() {
    return height() / 2;
  }

  function midPoint() {
    return {
      x: midX(),
      y: midY()
    };
  }

  function setSpiralCoords() {
    setBetterSpiralCoords();
  }

  function setBetterSpiralCoords() {
    var initialRadius = 2*R;
    var distance = 3*R;
    var coords =
        genArray({x: initialRadius, y: 0}, function(prev, idx) {
          var prevR = Math.sqrt(prev.x*prev.x + prev.y*prev.y);
          var deltaT = distance / prevR;
          var prevT = Math.atan(prev.y / prev.x);
          if (prev.x < 0) prevT += Math.PI;
          var nextT = prevT + deltaT;
          var newR = prevR + distance * deltaT / 2 / Math.PI;
          var nextX = newR * Math.cos(nextT);
          var nextY = newR * Math.sin(nextT);
          return {
            x: nextX,
            y: nextY
          };
        }, numBoxes);
    setCoords(coords);
  }

  function genLineCoords(startPoint, xStep, yStep, num) {
    return genArray(startPoint, function(prev) {
      return {
        x: prev.x + xStep,
        y: prev.y + yStep
      }
    }, num);
  }

  function setLineCoords() {
    setCoords(genLineCoords(pixelWalkStart, 20, 0, numBoxes));
  }

  function rotateCCW(dir) {
    return {
      x: -dir.y,
      y: dir.x
    };
  }

  function rotateCW(dir) {
    return {
      x: dir.y,
      y: -dir.x
    };
  }

  function setSprialGridCoords() {
    var coords = [ ];
    var curPos = midPoint();
    var stepSize = 1;
    var prevStepSize = 0;
    var dir = { x: 0, y: 30 };
    for (var remainingBoxes = numBoxes; remainingBoxes > 0; ) {
      var boxesThisStep = Math.min(remainingBoxes, stepSize);
      coords = coords.concat(genLineCoords(curPos, dir.x, dir.y, boxesThisStep));
      remainingBoxes -= boxesThisStep;
      curPos = {
        x: curPos.x + dir.x*stepSize,
        y: curPos.y + dir.y*stepSize
      };
      if (prevStepSize == stepSize) {
        prevStepSize = stepSize;
        ++stepSize;
      } else {
        prevStepSize = stepSize;
      }
      dir = rotateCCW(dir);
    }
    setCoords(coords);
  }

  function d2xy(d) {
    var n = 1;
    while (n < numBoxes) n *= 4;
    var curPos = {
      x: 0,
      y: 0
    };
    var s = 1;
    while (s*s < n/* && d > 0*/) {
      var rx = 1 & (d/2);
      var ry = 1 & (rx ^ d);

      // Rotate, if need be
      if (ry == 0) {
        if (rx == 1) {
          curPos = {
            x: s - 1 - curPos.x,
            y: s - 1 - curPos.y
          };
        }
        curPos = {
          x: curPos.y,
          y: curPos.x
        };
      }

      curPos = {
        x: curPos.x + s*rx,
        y: curPos.y + s*ry
      };

      s *= 2;
      d = Math.floor(d/4);
    }
    return curPos;
  }

  function setHilbertCoords() {
    var mp = {
      x: midX() - 100,
      y: height() - 100
    };
    var coords =
        genArray(mp, function(prev, idx) {
          var xy = d2xy(idx);
          return {
            x: mp.x + 30*xy.x,
            y: mp.y - 30*xy.y
          }
        }, numBoxes);
    setCoords(coords);
  }

  function setSineCoords() {
    var numReps = 5;
    var period = numBoxes / numReps;
    var coords =
        genArray({x:0,y:0}, function(prev, idx) {
          var vy = 5*Math.cos(idx * 2 * Math.PI / period);
          var vx = 1;
          var v = Math.sqrt(vx*vx + vy*vy);
          return {
            x: prev.x + 3*R*vx/v,//prev.x + 3*R*Math.cos(idx * 2 * Math.PI / period),//idx * 3*R,
            y: prev.y + 3*R*vy/v//3*R*Math.cos(idx * 2 * Math.PI / period)//20*R*Math.sin(idx * 2 * Math.PI / period)
          };
        }, numBoxes);
    setCoords(coords);
  }

  function setSnakeCoords() {
    var circleInterval = 3*R;
    var maxPerLine = width() / circleInterval;
    var coords = [];
    var curPos = {x:0,y:0};
    var curStep = circleInterval;
    for (var numLeft = numBoxes; numLeft > 0; numLeft -= maxPerLine) {
      coords = coords.concat(genLineCoords(curPos, curStep, 0, min(maxPerLine, numLeft)));
      curPos = {
        x: (maxPerLine - 1) * circleInterval + R - curPos.x,
        y: curPos.y + circleInterval
      };
      curStep = -curStep;
    }
    setCoords(coords);
  }

  function setRandomCoords() {
    setCoords(planarRandomWalk(0, 0, 3*R, numBoxes));
  }

  function addButtonClickHandler(id, fn) {
    d3.select('#' + id + '-button').on('click', fn);
  }

  this.addPixelCircles = function() {
    addButtonClickHandler('spiral', setSpiralCoords);
    addButtonClickHandler('line', setLineCoords);
    addButtonClickHandler('spiral-grid', setSprialGridCoords);
    addButtonClickHandler('hilbert', setHilbertCoords);
    addButtonClickHandler('sine', setSineCoords);
    addButtonClickHandler('snake', setSnakeCoords);
    addButtonClickHandler('random', setRandomCoords);

    addPixels();
    setSpiralCoords();

    return this;
  };

  this.update = function() {
    // Update pixels' colors.
    d('#pixels')
        .selectAll('circle.pixel')
        .attr('fill', function(d,i) {
          return rgbString(colors.map(function(color) {
            return color.history[i];
          }))
        })
    ;

  };

};
