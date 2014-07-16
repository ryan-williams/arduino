
var p = Paused.findOne({_id:id});
if (!p) {
  console.log("Bootstrapping Paused..");
  Paused.insert({_id:id, paused: true});
}

FrameIdxs.upsert({_id: id}, { $set: { idx: 0 }});
console.log("frame obj: %s", FrameIdxs.findOne({_id:id}).idx);

Frames.upsert({_id: id}, { $set: { 0: { r: 0, g: 0, b: 0 } }});

LastInvalidationIdxs.upsert({_id: id}, { $set: { idx: 0 }});

if (!Speeds.findOne({_id:id})) {
  console.log("bootstrapping Speed record");
  Speeds.insert({ _id:id, speed: 30 })
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
      position: record.position,
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
    constantWalk: { position: record.position },
    color: record.color,
    mode: record.mode,
    maxLength: defaultMaxLength,
    abbrev: record.abbrev,
    values: record.values,
    position: record.position
  }
}

var colorRecord = Colors.findOne({_id:id});
if (!colorRecord) {
  colorRecord =
  Colors.insert({
    _id: id,
    0: { values: [] },
    1: { values: [] },
    2: { values: [] }
  });
}

var colors =
    [colorRecord[0], colorRecord[1], colorRecord[2]]
        .map(colorWalkParams)
        .map(function(params) {
          return new ColorWalks(params);
        });

var fpsMonitor = new FpsMonitor();

frames = new ReactiveArray(
    {
      maxLength: 200,
      genBelow: 20,
      genChunk: 2,
      generator: function() {
        var n = colors.map(function(color) { return color.step(); });
        return n;
      }
      ,onInvalidated: function(idx) {
        console.log("\tmongo updating last invalidated: %d", idx);
        LastInvalidationIdxs.update({_id:id}, { $set: { idx: idx }});
      }
    }
);

Meteor.methods({
  getFrames: function(from, to) {
    return frames.get(from, to);
  }
});

function stepColor() {
  frames.advance();

  FrameIdxs.update({_id: id}, { $set: { idx: frames.getIdx() }} );

  fpsMonitor.checkpoint(true);
}

var interval = null;

function handleStartOrPause(newRecord) {
  var step = !!newRecord.step;
  var paused = !!newRecord.paused;
  //console.log("handleStartOrPause: " + paused);
  if (paused || step) {
    Meteor.clearInterval(interval);
    interval = null;
    fpsMonitor.clear();
  } else {
    interval = Meteor.setInterval(stepColor, stepTimeMS);
  }

  if (step) {
    stepColor();
    Paused.update({_id: id}, {$set: {step: false, paused: true}});
  } else {
    console.log("pause change: " + paused);
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

  Speeds.find({_id:id}).observe({
    changed: function(nr) {
      if (!!nr.speed && nr.speed != stepTimeMS) {
        console.log("setting new speed: " + nr.speed);
        stepTimeMS = nr.speed;
        fpsMonitor.clear();
        if (interval != null) {
          Meteor.clearInterval(interval);
          interval = Meteor.setInterval(stepColor, stepTimeMS);
        }
      }
    }
  });

  Colors.find({_id: id}).observe({
    changed: function(nr) {
      var unsetObj = {};
      var foundNewPos = false;
      var invalidated = false;
      colors.forEach(function(color, idx) {
        if (nr.mode) {
          if (color.maybeUpdateMode(nr.mode)) {
            invalidated = true;
          }
        }

        if (nr[idx]) {

          if (nr[idx].newPosition >= 0) {
            foundNewPos = true;
            invalidated = true;
            console.log(idx +": found new pos " + nr[idx].newPosition + " cur: " + color.curWalk.position);
            color.setPosition(nr[idx].newPosition);
            unsetObj[idx + '.newPosition'] = 1;
          }
        }
      });
      if (foundNewPos) {
        Colors.update({_id: id}, { $unset: unsetObj });
        serialWriteColor.apply(this, [0,1,2].map(function(idx) { return unsetObj[idx + '.newPosition']; }));
      }
      if (invalidated) {
        frames.invalidateLookAhead();
      }
    }
  });
};

