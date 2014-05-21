
Timer = function(options) {
  options = options || {};

  var startTime = null;
  var prevTime = null;
  var numTimings = 0;

  var keepLastNTimings = options.keepLastNTimings || 0;
  this.lastTimings = [];

  var keepHistogram = !!options.keepHistogram;
  this.timings = [];

  this.justCrossedSecondBoundary = false;

  this.clear = function() {
    startTime = null;
    prevTime = null;
    numTimings = 0;
    this.timings = [];
  };
  this.clear();

  this.checkpoint = function() {
    var curTime = new Date().getTime();
    if (prevTime) {
      var curTiming = curTime - prevTime;
      if (curTiming >= this.timings.length) {
        for (var i = this.timings.length; i < curTiming; ++i) {
          this.timings[i] = 0;
        }
      }

      if (keepHistogram) {
        this.timings[curTiming] = (this.timings[curTiming] || 0) + 1;
      }

      if (keepLastNTimings) {
        this.lastTimings.push(curTiming);
        if (this.lastTimings.length > keepLastNTimings) {
          this.lastTimings = this.lastTimings.slice(this.lastTimings.length - keepLastNTimings);
        }
      }
    }
    this.justCrossedSecondBoundary = prevTime && (Math.floor(curTime / 1000) > Math.floor(prevTime / 1000));
    numTimings++;
    if (!startTime) {
      startTime = curTime;
    }
    prevTime = curTime;
    return prevTime;
  };

  this.rate = function() {
    return ((prevTime - startTime) / numTimings).toFixed(2);
  };

  this.fps = function() {
    return (numTimings * 1000 / (prevTime - startTime)).toFixed(2);
  };

  this.toString = function() {
    return this.rate() + " (" + this.fps() + " fps, " + (prevTime - startTime) + "/" + numTimings + ")";
  };
};
