
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
        return rgbString(colors.map(function(color) {
          return color.history[i];
        }))
      })
  ;

  sliders.update();

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

var sliders = null;
window.runColorDisplay = function() {

  Math.seedrandom(3);

  addPixelCircles();

  sliders = new Sliders({
    colors: colors,
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness
  });
  sliders.addNumLines();

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

