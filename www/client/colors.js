
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

  widgets.map(function(widget) { widget.update(); });

}

var paused = true;
var timeout = null;

var widgets = [];

window.runColorDisplay = function() {

  Math.seedrandom(3);

  var standardOpts = {
    colors: colors,
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness
  };

  addPixelCircles();

  widgets.push(new Sliders(standardOpts).addNumLines());
  widgets.push(new Paths(standardOpts).addPaths());
  widgets.push(new Trail(standardOpts).addColorTrail());

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

