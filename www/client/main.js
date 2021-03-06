
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

fpsMonitor = new FpsMonitor({
  keepLastNTimings: 100
});
var frameMonitor = new FrameMonitor();

var paused = false;
var speed = 30;

serverFrameIdx = 0;
serverFrames = [];
framesBuffer = 10;
numFramesToFetch = 20;

function rerenderPage() {

  frameMonitor.logFrame(serverFrameIdx);

  var framesToRender = serverFrames.slice(Math.max(0, serverFrameIdx - defaultMaxLength), serverFrameIdx);

  if (!framesToRender.length) return;

  var mockedColors = framesToRender.length == 0 ? [] :
      [0,1,2].map(function(idx) {
        var color = [];
        framesToRender.forEach(function (frame, frameIdx) {
          color[frameIdx] = frame[idx];
        });
        return {
          values: color.reverse()
        };
      });

//  console.log("serverFrames: %O, mocked: %O", serverFrames, mockedColors);
//  console.log("framesToRender: %O", framesToRender);
  standardOpts.colors = mockedColors;
  standardOpts.frames = framesToRender;
  standardOpts.positions = framesToRender[framesToRender.length - 1];
  new Sliders(standardOpts).addNumLines().update();
  new Paths(standardOpts).addPaths().update();
  new Trail(standardOpts).addColorTrail().update();
  var pixels = new Pixels(standardOpts).addPixelCircles().update();
  if (!firstTime) {
    firstTime = true;
    pixels.setSpiralCoords();
  }

  if (!paused) {
    fpsMonitor.checkpoint(true);
    //Session.set('timings', fpsMonitor.timings());
    Session.set('lastTimings', fpsMonitor.lastTimings());
  }
}

lastInvalidationServerFrameIdx = 0;
waitingOnFetch = false;

function initReactiveUpdating(shouldRenderToo) {

  Deps.autorun(function() {
    serverFrameIdx = getFrameIdx();

    if (lastInvalidationServerFrameIdx) {
      console.log("\tinvalidating at frame %d, past %d..", serverFrameIdx, lastInvalidationServerFrameIdx);
      serverFrames = serverFrames.slice(0, Math.min(serverFrameIdx, lastInvalidationServerFrameIdx));
      lastInvalidationServerFrameIdx = 0;
    }

    //console.log("\t\tgot server frame %d", serverFrameIdx);
    if (serverFrameIdx + framesBuffer > serverFrames.length) {
      var fetchFrom = Math.min(serverFrames.length, serverFrameIdx);
      var fetchTo = serverFrameIdx + numFramesToFetch;
      console.log(
          "\tbuffer down to %d, fetching [%d,%d)..",
              serverFrames.length - serverFrameIdx,
          fetchFrom,
          fetchTo
      );
      if (!waitingOnFetch) {
        waitingOnFetch = true;
        Meteor.call('getFrames', fetchFrom, fetchTo, function (err, res) {
          waitingOnFetch = false;
          var from = res[0][0];
          var to = res[0][1];
          var frames = res[1];
          console.log(
              "\tgot %d frames: [%d,%d) on [%d,%d)",
              frames.length,
              from, to,
              fetchFrom, fetchTo
          );
          for (var i = from; i < to; ++i) {
            serverFrames[i] = frames[i - from];
          }
        });
      } else {
        console.log("\t%calready have a fetch out", 'color:orange');
      }
    }
    if (serverFrameIdx >= serverFrames.length) {
      console.log("\ttrying to render frame %d, only have up to %d", /*"color:red", */serverFrameIdx, serverFrames.length);
    } else if (shouldRenderToo) {
      rerenderPage();
    }
  });
}

function initPollingAnimation() {
  function stepFrame() {

  }
  window.requestAnimationFrame(stepFrame);
}

Template.colors.rendered = function() {

  Session.set('timings', []);
  Session.set('graph_bucket_width', 5);

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

  Deps.autorun(function() {
    console.log("%ccaught invalidation at frame %d", 'color:red', serverFrameIdx);
    lastInvalidationServerFrameIdx = getLastInvalidationIdx();
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

  Deps.autorun(function() {
    var timings = Session.get('timings');
    if (!timings || !timings.length) return;
    //console.log("graphing: %O", timings);
    var bucketWidth = Session.get('graph_bucket_width');
    new Dygraph(
        document.getElementById('fps-graph'),
        _.range(0, Math.ceil(timings.length / bucketWidth)).map(function(idx) {
          return [ idx * bucketWidth, timings.slice(idx * bucketWidth, (idx + 1) * bucketWidth).sum() ];
        }),
        {
          xlabel: 'time per frame (ms)',
          ylabel: '# frames',
          labels: [ 'time', '# frames' ]
        }
    );
  });

  Deps.autorun(function() {
    var lastTimings = Session.get('lastTimings');
    if (!lastTimings || !lastTimings.length) return;
    new Dygraph(
        document.getElementById('last-timings-graph'),
        lastTimings.reverse().map(function(timing, idx) {
          return [ idx, timing ];
        }),
        {
          labels: [ 'ms ago', 'frame time (ms)' ],
          rollPeriod: 10,
          valueRange: [0, 150]
        }
    )
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
