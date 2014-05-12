
var defaultMaxLength = 256;
var minBrightness = 0;
var maxBrightness = 255;

var i;

var fontSize = 15;

var standardOpts = {
  fontSize: fontSize,
  minBrightness: minBrightness,
  maxBrightness: maxBrightness,
  maxLength: defaultMaxLength
};

var firstTime = false;

var fpsMonitor = new FpsMonitor();
var frameMonitor = new FrameMonitor();

var c = null;

var paused = false;

function rerenderPage() {
  if (!c || !c[0]) return;
  var frameIdx = c.frameIdx;

  frameMonitor.logFrame(frameIdx, c.speed);

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

  fpsMonitor.checkpoint(true, c.speed);
}

function initReactiveUpdating(shouldRenderToo) {
  Deps.autorun(function() {
    c = getColorRecord();
    if (shouldRenderToo) {
      rerenderPage();
    }
  });
}

//function initPollingAnimation() {
//  window.requestAnimationFrame();
//}

Template.colors.rendered = function() {

  Math.seedrandom(3);

  var speedSlider = new Range({
    $el: $('.range-div'),
    min: 10,
    max: 1000,
    valueSubscribeFn: function() {
      return getSpeed();
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
      Speeds.update({_id: id}, { $set: { speed: newSpeed }});
      return newSpeed;
    }
  });

  initReactiveUpdating(true);

  Deps.autorun(function() {
    if(isPaused() != paused) {
      paused = !paused;
      fpsMonitor.clear();
    }
  });

  Deps.autorun(function() {
    var newSpeed = getSpeed();
    if (newSpeed != speed) {
      console.log("resetting FrameMonitor due to new speed " + speed);
      speed = newSpeed;
      frameMonitor.reset(serverFrameIdx);
      fpsMonitor.clear();
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
