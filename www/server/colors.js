
var stepTimeMS = 20;
var maxV = 10;
var minBrightness = 0;
var maxBrightness = 255;
var middleBrightness = (minBrightness + maxBrightness) / 2;
defaultMaxLength = 256;

var i;

var fontSize = 15;

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

function colorWalkParams(sineFreq, color, abbrev) {
  if (sineFreq && sineFreq.length && sineFreq.length == 3) {
    color = sineFreq[1];
    abbrev = sineFreq[2];
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
    color: color,
    maxLength: defaultMaxLength,
    abbrev: abbrev
  }
}

var colors =
    [[250, '#F00', 'r'], [200, '#0F0', 'g'], [150, '#00F', 'b']]
        .map(colorWalkParams)
        .map(function(params) {
          return new ColorWalks(params);
        });


function stepColor() {

  colors.forEach(function(color) { color.step(); });

//   console.log("new reds: " + colors[0].history.map(function(h) { return Math.round(h, 2); }).join(','));

  var setObj = {};
  [0,1,2].forEach(function(idx) {
    [
      ['values', 'history'],
      'position',
      'velocity',
      'color',
      'abbrev',
      'maxLength'
    ].forEach(function(key) {
      if (typeof key == 'string') key = [key, key];
      setObj[idx + '.' + key[0]] = colors[idx][key[1]]
    });
  });

  Colors.update({_id: id}, {$set: setObj});
}

var interval = null;

function handleStartOrPause(newRecord) {
  var step = !!newRecord.step;
  var paused = !!newRecord.paused;
  if (paused || step) {
    Meteor.clearInterval(interval);
  } else {
    interval = Meteor.setInterval(stepColor, stepTimeMS);
  }

  if (step) {
    stepColor();
    Paused.update({_id: id}, {$set: {step: false, paused: true}});
  }
}

runColorDisplay = function() {

  Math.seedrandom(3);

  var standardOpts = {
    colors: colors,
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness,
    maxLength: defaultMaxLength
  };

//  widgets.push(new Paths(standardOpts).addPaths());
//  widgets.push(new Trail(standardOpts).addColorTrail());
//  widgets.push(new Pixels(standardOpts).addPixelCircles());

  Paused.find({_id: id}).observe({
    added: handleStartOrPause,
    changed: handleStartOrPause
  });

  Colors.find({_id: id}).observe({
    changed: function(nr) {
      colors.forEach(function(color, idx) {
        if (nr[idx]) {
          if (nr[idx].mode) {
            color.maybeUpdateMode(nr[idx].mode);
          }

          if (nr[idx].position != color.curWalk.position) {
            console.log("found new pos " + nr[idx].position + " cur: " + color.curWalk.position);
            color.setPosition(nr[idx].position);
          }
        }

      });
    }
  });

};

