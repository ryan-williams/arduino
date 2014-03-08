
var stepTimeMS = 20;
var maxV = 10;
var minBrightness = 0;
var maxBrightness = 255;
var middleBrightness = (minBrightness + maxBrightness) / 2;

var debug = 0;

var numBoxes = 125;

var R = 10;

var i;

var fontSize = 15;

var numLineStartY = 30;
var serifHeight = 10;

var pixelWalkStart = { x: 50, y: 250 };

var pathsUpperLeft = { x: 0, y: fontSize };
var pathsLabelLeft = 5;
var pathsMaxHeight = maxBrightness - minBrightness;

var randomWalkOptions = {
  initialValue: middleBrightness,
  maxAcceleration: 0.5,
  maxVelocity: maxV,
  minPosition: minBrightness,
  maxPosition: maxBrightness
};

function sineWalkOptions(period, initialRandomness, incrementalRandomness) {
  return {
    period: period,
    initialRandomness: initialRandomness,
    incrementalRandomness: incrementalRandomness,
    minPosition: minBrightness,
    maxPosition: maxBrightness
  };
}

function colorWalkParams(sineFreq, color) {
  if (sineFreq && sineFreq.length && sineFreq.length == 2) {
    color = sineFreq[1];
    sineFreq = sineFreq[0];
  }
  return {
    sineWalk: sineWalkOptions(sineFreq, true),
    randomWalk: randomWalkOptions,
    randomSineWalk: {
      halfPeriod: 50,
      minPosition: minBrightness,
      maxPosition: maxBrightness
    },
    constantWalk: { value: 100 },
    color: color
  }
}

var colors =
    [[250, '#F00'], [200, '#0F0'], [150, '#00F']]
        .map(colorWalkParams)
        .map(function(params) {
          return new ColorWalks(params);
        });

function addPixelCircles() {
  var circleCoords = spiralWalk(pixelWalkStart.x, pixelWalkStart.y, 2*R + 5, numBoxes);

  d('#pixels')
      .selectAll('circle.pixel')
      .data(circleCoords)
      .enter()
      .append('circle')
      .attr('class', 'pixel')
      .attr("r", R)
      .attr('cx', function(d) {
        return Math.floor(d.x);
      })
      .attr('cy', function(d) {
        return Math.floor(d.y);
      });
}

function getNumLineData(colorWalk) {
  var leftPad = 5;
  var rightPad = 5;
  return {
    colorWalk: colorWalk,
    elems: function(width) {
      var rightEdge = width - rightPad;
      return {
        left: leftPad,
        right: rightEdge,
        width: rightEdge - leftPad,
        lines: [
          {
            start: { x: leftPad, y: numLineStartY - serifHeight },
            end: { x: leftPad, y: numLineStartY + serifHeight }
          },
          {
            start: { x: leftPad, y: numLineStartY },
            end: { x: rightEdge, y: numLineStartY }
          },
          {
            start: { x: rightEdge, y: numLineStartY - serifHeight },
            end: { x: rightEdge, y: numLineStartY + serifHeight }
          }
        ],
        labels: {
          currentValue: {
            fn: function() { return colorWalk.position; },
            x: 10,
            y: numLineStartY - serifHeight
          },
          minValue: {
            fn: function() { return minBrightness; },
            x: leftPad,
            y: numLineStartY + serifHeight + fontSize
          },
          maxValue: {
            fn: function() { return maxBrightness; },
            x: rightEdge - 25,
            y: numLineStartY + serifHeight + fontSize
          }
        }
      };
    }
  }
}

function addNumLineLines() {
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('line')
      .data(function(d) {
        return d.lines.addEach('color', d.colorWalk.color);
      })
      .enter()
      .append('line')
      .attr('x1', acc('start.x'))
      .attr('y1', acc('start.y'))
      .attr('x2', acc('end.x'))
      .attr('y2', acc('end.y'))
      .style('stroke-width', 2)
      .style('stroke', acc('color'))
  ;
}

function addNumLineSliderCircles() {
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('circle')
      .data(function(d) {
        return [{
          fn: function() { return d.colorWalk.position; },
          cy: d.lines[1].start.y,
          minX: d.lines[1].start.x,
          maxX: d.lines[1].end.x
        }];
      })
      .enter()
      .append('circle')
      .attr('class', 'pointer')
      .attr('r', 5)
      .attr('fill', '#000')
      .attr('cy', function(d) {
        return Math.floor(d.cy);
      })
  ;
}

function addNumLineLabels() {
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('text')
      .data(function(d) {
        return [
          d.labels.currentValue,
          add(d.labels.minValue, 'color', d.colorWalk.color),
          add(d.labels.maxValue, 'color', d.colorWalk.color)
        ]
      })
      .enter()
      .append('text')
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize + "px")
      .attr("fill", acc('color'))
      .attr('x', acc('x'))
      .attr('y', acc('y'));
}

function addNumLines() {
  var numLines = colors.map(function(color) { return getNumLineData(color); });

  var sliderDivs =
          d('.sliders')
              .selectAll('div.slider-div.svg-div')
              .data(numLines)
              .enter()
              .append('div')
              .attr('class', 'slider-div svg-div')
      ;

  var svgDivs = sliderDivs.append('div').attr('class', 'span3');

  var width = parseInt(svgDivs.style('width'));

  var svgs =
          svgDivs
              .selectAll('svg.slider')
              .data(function(d) {
                return [ add(d.elems(width), 'colorWalk', d.colorWalk) ];
              })
              .enter()
              .append('svg')
              .attr('class', 'slider')
      ;

  var buttonDivs = sliderDivs.append('div');

  var buttonTypes = [
    [ 'random-sine', 'rsin' ],
    [ 'sine', 'sine' ],
    [ 'random', 'rand' ],
    [ 'constant', 'const' ]
  ];

  var buttons =
      buttonDivs
          .selectAll('input.pause')
          .data(function(d) {
            return buttonTypes.map(function(mode) {
              return {
                colorWalk: d.colorWalk,
                mode: mode[0],
                label: mode[1]
              };
            });
          })
          .enter()
          .append('input')
          .attr('class', 'pause')
          .attr('type', 'button')
          .attr('value', acc('label'))
          .on('click', function(d,i) {
            d.colorWalk.setWalkType(d.mode);
          })
      ;

  var numlines =
          dAppend(svgs, 'g.numlines')
              .on('click', function(d) {
                var logicalX = interpolate(d3.event.offsetX, d.left, d.right, minBrightness, maxBrightness);
                d.colorWalk.setPosition(logicalX);
              })
      ;

  var clickerRects =
      dAppend(
          numlines,
          'rect.clicker',
          {
            width: acc('width'),
            height: 2*serifHeight,
            fill: '#000',
            'fill-opacity': 0.05,
            y: numLineStartY - serifHeight,
            x: acc('left')
          }
      );

  addNumLineLines();
  addNumLineSliderCircles();
  addNumLineLabels();
}

function addPaths() {
  var width = parseInt($('#paths').css('width'));
  var pathsGroup = d('#paths').append('g').attr('class', 'paths');
  pathsGroup
      .selectAll('path')
      .data(colors.map(function(color) {
        return {
          colorFn: function() { return color; },
          width: width
        };
      }))
      .enter()
      .append('path')
      .attr('stroke', function(d) { return d.colorFn().color; })
      .attr('stroke-width', 2)
      .attr('fill', 'transparent')
  ;

  pathsGroup
      .selectAll('text')
      .data([
        {
          label: maxBrightness,
          y: pathsUpperLeft.y - 5
        },
        {
          label: minBrightness,
          y: pathsUpperLeft.y + pathsMaxHeight + fontSize + 5
        }
      ])
      .enter()
      .append('text')
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize + "px")
      .attr("fill", '#000')
      .attr('x', pathsLabelLeft)
      .attr('y', acc('y'))
      .text(acc('label'))
  ;
}

function stepColor() {

  colors.forEach(function(color) { color.step(); });

  // Update pixels' colors.
  d('#pixels')
      .selectAll('circle.pixel')
      .attr('fill', function(d,i) {
        return rgbString(colors.map(function(color) { return color.history[i]; }))
      })
  ;

  // Slide number-lines' circle-indicators.
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('circle')
      .attr('cx', function(d) {
        return interpolate(Math.floor(d.fn()), minBrightness, maxBrightness, d.minX, d.maxX);
      })
  ;

  // Update number-lines' labels.
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('text')
      .text(function(d) {
        return Math.floor(d.fn());
      })
  ;

  // Update color-history paths.
  var pathsWidth = parseInt($('#paths').css('width'));
  d('#paths')
      .selectAll('g.paths')
      .selectAll('path')
      .attr('d', function(d) {
        var color = d.colorFn();
        var xScale = pathsWidth / color.maxLength;
        return pathData(
            color.history.map(function(value) {
              return interpolate(
                  value,
                  minBrightness,
                  maxBrightness,
                  // Tricky: reverse the projected min and max to make higher "value"s map to lower y-values
                  // (a.k.a. higher on screen).
                  pathsUpperLeft.y + pathsMaxHeight,
                  pathsUpperLeft.y
              );
            }),
            xScale
        );
      })
  ;

  var trail = $('#trail');
  var trailWidth = parseInt(trail.css('width'));
  var rectHeight = parseInt(trail.css('height'));

  d('#trail')
      .selectAll('g.trail')
      .selectAll('rect')
      .data(colors[0].history.map(function(histElem, elemIdx) {
        return {
          colorValues: colors.map(function(color) { return color.history[elemIdx]; }),
          width: Math.ceil(trailWidth / colors[0].maxLength)
        };
      }))
      .enter()
      .append('rect')
  ;
  d('#trail')
      .selectAll('g.trail')
      .selectAll('rect')
      .attr('width', acc('width'))
      .attr('height', rectHeight)
      .attr('x', function(d,i) { return Math.floor(i * d.width); })
      .attr('fill', function(d, i) {
        return rgbString(d.colorValues);
      })
  ;

}

function addColorTrail() {
  d('#trail')
      .append('g')
      .attr('class', 'trail');
}

var paused = true;
var timeout = null;

window.runColorDisplay = function() {

  Math.seedrandom(3);

  addPixelCircles();
  addNumLines();
  addPaths();
  addColorTrail();

  function colorLoop() {
    stepColor();
    timeout = setTimeout(colorLoop, stepTimeMS);
  }

  function handleStartOrPause() {
    if (paused) {
      $('#pause-button').attr('value', 'Resume');
      clearTimeout(timeout);
    } else {
      $('#pause-button').attr('value', 'Pause');
      colorLoop();
    }
  }

  d3.selectAll('#pause-button')
      .on('click', function(d) {
        paused = !paused;
        handleStartOrPause();
      });

  handleStartOrPause();

};

