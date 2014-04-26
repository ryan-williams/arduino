
var defaultMaxLength = 256;
var minBrightness = 0;
var maxBrightness = 255;

var i;

var fontSize = 15;

Template.colors.rendered = function() {

  Math.seedrandom(3);

  var standardOpts = {
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness,
    maxLength: defaultMaxLength
  };

  var firstTime = false;

  var speedSlider = new Range({
    $el: $('.range-div'),
    min: 10,
    max: 1000,
    valueSubscribeFn: function() {
      var c = getColorRecord();
      if (c) {
        return c.speed;
      }
    },
    v2r: function(value) {
      var logValue = Math.log(value);
      var logMin = Math.log(this.min);
      var logMax = Math.log(this.max);
      return interpolate(logValue, logMin, logMax, parseInt(this.min), parseInt(this.max));
    },
    r2v: function(rawValue) {
      var newSpeed =
          Math.floor(
              Math.exp(
                  interpolate(rawValue, this.min, this.max, Math.log(this.min), Math.log(this.max))
              )
          );
      console.log("sending down speed: " + newSpeed);
      Colors.update({_id: id}, { $set: { speed: newSpeed }});
      return newSpeed;
    }
  });

  var prevFrameIdx = -1;
  var lastFrameReset = 0;
  var totalMissedFrames = 0;
  var lastSkipTop = 0;
  var lastSpeed = null;
  Deps.autorun(function() {
    var c = getColorRecord();
    if (c && c[0]) {
      var frameIdx = c.frameIdx;
      if (prevFrameIdx != -1) {
        var framesMissed = frameIdx - (prevFrameIdx + 1);
        if (framesMissed > 0) {
          console.log(
              "%d frames later, missed %d frames, went from %d to %d. current ratio: %s (%d/%d)",
              (frameIdx - lastSkipTop),
              framesMissed,
              prevFrameIdx,
              frameIdx,
                  frameIdx == 0 ? "???" : (totalMissedFrames / (frameIdx - lastFrameReset)).toFixed(2),
              totalMissedFrames,
              (frameIdx - lastFrameReset)
          );
          lastSkipTop = frameIdx;
          totalMissedFrames += framesMissed;
        } else if (framesMissed < 0) {
          console.error("wtf? redid frame %d, was at %d", frameIdx, prevFrameIdx);
        }
      }
      prevFrameIdx = frameIdx;
      var colors = [c[0], c[1], c[2]];
      colors.forEach(function(color) {
        color.values = color.values || [];
      });
      standardOpts.colors = colors;
      new Sliders(standardOpts).addNumLines().update();
      new Paths(standardOpts).addPaths().update();
      new Trail(standardOpts).addColorTrail().update();
      var pixels = new Pixels(standardOpts).addPixelCircles().update();
      if (!firstTime) {
        firstTime = true;
        pixels.setSpiralCoords();
      }
      if (c.speed != lastSpeed) {
        console.log("resetting due to new speed " + c.speed);
        totalMissedFrames = 0;
        lastFrameReset = frameIdx;
      }
      lastSpeed = c.speed;
    }
  });

  new Picker({
    selector: '#picker',
    width: 300,
    height: 300,
    colorClickFn: function(rgb) {
      var setObj = {};
      'rgb'.split('').map(function(key, idx) {
        setObj[idx + '.newPosition'] = rgb[key];
      });
      console.log(setObj);
      Colors.update({_id: id}, { $set: setObj });
    }
  });

  new Modes().addButtons();

  d3.selectAll('#pause-button')
      .on('click', togglePaused);

  d3.selectAll('#step-button')
      .on('click', function(d) {
        Paused.update({_id: id}, {$set: {step: true, paused: true}});
      });

  d3.select('body')
      .on('keydown', function(d) {
        var keyId = d3.event.keyIdentifier;
        var keyCode = d3.event.keyCode;
        if (keyId == 'Right') {
          Paused.update({_id: id}, {$set: {step: true, paused: true}});
        }
        if (keyCode == 32) {
          togglePaused();
          d3.event.preventDefault();
        }
      });

  console.log("rendered 'colors'...");
};
