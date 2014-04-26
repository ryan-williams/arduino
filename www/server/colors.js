
var p = Paused.findOne({_id:id});
if (!p) {
  console.log("Bootstrapping Paused..");
  Paused.insert({_id:id, paused: true});
}

var c = Colors.findOne({_id:id});

if (!c || !('0' in c)) {
  console.log("bootstrapping colors...");
  Colors.update({_id:id}, {
    $set: {
      0: {
        abbrev: 'r',
        color: '#F00',
        values: [],
        position: 0,
        sineFreq: 250
      },
      1: {
        abbrev: 'g',
        color: '#0F0',
        values: [],
        position: 0,
        sineFreq: 200
      },
      2: {
        abbrev: 'b',
        color: '#00F',
        values: [],
        position: 0,
        sineFreq: 150
      }
    }
  });
}

var stepTimeMS = 40;
var maxV = 10;
var minBrightness = 0;
var maxBrightness = 255;
defaultMaxLength = 256;

var i;

var fontSize = 15;

function sineWalkOptions(period, initialRandomness, incrementalRandomness) {
  return {
    period: period,
    initialRandomness: initialRandomness,
    incrementalRandomness: incrementalRandomness,
    minPosition: minBrightness,
    maxPosition: maxBrightness
  };
}

function colorWalkParams(record) {
  return {
    sineWalk: sineWalkOptions(record.sineFreq || 200, true),
    randomWalk: {
      initialValue: record.position,
      maxAcceleration: 0.5,
      maxVelocity: maxV,
      minPosition: minBrightness,
      maxPosition: maxBrightness
    },
    randomSineWalk: {
      position: record.position,
      halfPeriod: 50,
      minPosition: minBrightness,
      maxPosition: maxBrightness
    },
    constantWalk: { value: 100 },
    color: record.color,
    maxLength: defaultMaxLength,
    abbrev: record.abbrev,
    values: record.values,
    position: record.position
  }
}

var colorRecord = Colors.findOne({_id:id});

var colors =
    [colorRecord[0], colorRecord[1], colorRecord[2]]
        .map(colorWalkParams)
        .map(function(params) {
          return new ColorWalks(params);
        });

var frameIdx = 0;

function stepColor() {

  colors.forEach(function(color) { color.step(); });
  frameIdx++;

  var setObj = {
    frameIdx: frameIdx
  };
  [0,1,2].forEach(function(idx) {
    [
      'values',
      'position',
      'velocity',
      'color',
      'abbrev',
      'maxLength'
    ].forEach(function(key) {
      setObj[idx + '.' + key] = colors[idx][key]
    });
  });

  Colors.update({ _id: id }, { $set: setObj });
}

var interval = null;

function handleStartOrPause(newRecord) {
  var step = !!newRecord.step;
  var paused = !!newRecord.paused;
  if (paused || step) {
    Meteor.clearInterval(interval);
    interval = null;
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

  Paused.find({_id: id}).observe({
    added: handleStartOrPause,
    changed: handleStartOrPause
  });

  Colors.find({_id: id}).observe({
    changed: function(nr) {
      if (!!nr.speed && nr.speed != stepTimeMS) {
        console.log("setting new speed: " + nr.speed);
        stepTimeMS = nr.speed;
        if (interval != null) {
          Meteor.clearInterval(interval);
          interval = Meteor.setInterval(stepColor, stepTimeMS);
        }
      }

      var unsetObj = {};
      var setObj = {};
      var foundNewPos = false;
      colors.forEach(function(color, idx) {
        if (nr[idx]) {

          if (nr.mode) {
            color.maybeUpdateMode(nr.mode);
          }

          if (nr[idx].newPosition >= 0) {
            foundNewPos = true;
            console.log(idx +": found new pos " + nr[idx].newPosition + " cur: " + color.curWalk.position);
            color.setPosition(nr[idx].newPosition);
            unsetObj[idx + '.newPosition'] = 1;
            setObj[idx + '.position'] = nr[idx].newPosition;
          }
        }
      });
      if (foundNewPos) {
        Colors.update({_id: id}, { $unset: unsetObj, $set: setObj });
      }
    }
  });
};

