
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

var pathXScale = 4;

var numLineStartY = 30;
var numLineWidth = 300;
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
  return {
    colorWalk: colorWalk,
    lines: [
      {
        start: { x: 0, y: numLineStartY - serifHeight },
        end: { x: 0, y: numLineStartY + serifHeight }
      },
      {
        start: { x: 0, y: numLineStartY },
        end: { x: numLineWidth, y: numLineStartY }
      },
      {
        start: { x: numLineWidth, y: numLineStartY - serifHeight },
        end: { x: numLineWidth, y: numLineStartY + serifHeight }
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
        x: 0,
        y: numLineStartY + serifHeight + fontSize
      },
      maxValue: {
        fn: function() { return maxBrightness; },
        x: numLineWidth - 5,
        y: numLineStartY + serifHeight + fontSize
      }
    }
  }
}

function addNumLineLines() {
  d3.selectAll('.slider')
      .selectAll('g.numlines')
      .selectAll('line')
      .data(function(d) { return d.lines.addEach('color', d.colorWalk.color); })
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
  var numLines = colors.map(getNumLineData);

  var sliderDivs =
          d('.sliders')
              .selectAll('div.slider-div.svg-div')
              .data(numLines)
              .enter()
              .append('div')
              .attr('class', 'slider-div svg-div')
      ;

  var svgDivs = dAppend(sliderDivs, 'div.span3');
  var svgs = dAppend(svgDivs, 'svg.slider');

  var buttonDivs = dAppend(sliderDivs, 'div.span1');
  var buttons =
      dAppend(buttonDivs, 'input.pause', { type: 'button' })
          .text('Pause')
          .on('click', function(d,i) {
            d.colorWalk.incWalkType();
          })
      ;

  var numlines =
          svgs.selectAll('g.numlines')
              .data(function(d, i) { return [ numLines[i] ]; })
              .enter()
              .append('g')
              .attr('class', 'numlines')
              .on('click', function(d,i) {
                var logicalX = interpolate(d3.event.offsetX, 0, numLineWidth, minBrightness, maxBrightness);
                console.log(logicalX);
                d.colorWalk.setPosition(logicalX);
              })
      ;

  var clickerRects =
      dAppend(
          numlines,
          'rect.clicker',
          {
            width: numLineWidth,
            height: 2*serifHeight,
            fill: '#000',
            'fill-opacity': 0.05,
            y: numLineStartY - serifHeight,
            x: 0
          }
      );

  addNumLineLines();
  addNumLineSliderCircles();
  addNumLineLabels();
}

function addPaths() {
  var pathsGroup = d('#paths').append('g').attr('class', 'paths');
  pathsGroup
      .selectAll('path')
      .data(colors.map(function(color) { return function() { return color; }; }))
      .enter()
      .append('path')
      .attr('stroke', function(d) { return d().color; })
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
  d('#paths')
      .selectAll('g.paths')
      .selectAll('path')
      .attr('d', function(d) {
        return pathData(
            d().history.map(function(value) {
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
            pathXScale
        );
      })
  ;

  var rectWidth = 4;
  var rectHeight = 20;

  d('#trail')
      .selectAll('g.trail')
      .selectAll('rect')
      .data(colors[0].history)
      .enter()
      .append('rect')
  ;
  d('#trail')
      .selectAll('g.trail')
      .selectAll('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('x', function(d,i) { return i * rectWidth; })
      .attr('fill', function(d, i) {
        return rgbString(colors.map(function(color) { return color.history[i]; }));
      })
  ;

}

function addColorTrail() {

  d('#trail')
      .selectAll('g.trail')
      .data([1])
      .enter()
      .append('g')
      .attr('class', 'trail');

}

window.runColorDisplay = function() {

  Math.seedrandom(3);

  addPixelCircles();
  addNumLines();
  addPaths();
  addColorTrail();

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, stepTimeMS);
  }
  colorLoop();

};

