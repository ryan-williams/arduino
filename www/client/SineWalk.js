
var maxLength = 125;

SineWalk = function(options) {

  var nextStep = 0;
  if (options.initialRandomness) {
    nextStep = Math.random() * options.period;
  }
  this.history = [];

  this.paused = false;
  this.pause = function() {
    this.paused = !this.paused;
  };

  this.step = function(nextPos) {
    if (nextPos) {
      var forcedSinValue = interpolate(nextPos, options.minPosition, options.maxPosition, -1, 1);
      nextStep = interpolate(Math.asin(forcedSinValue), 0, 2* Math.PI, 0, options.period);
    } else {
      if (this.paused) {
        nextPos = this.history[0];
      } else {
        nextPos = interpolate(
            Math.sin(2 * Math.PI * (nextStep / options.period)),
            -1, 1,
            options.minPosition, options.maxPosition
        );
        if (options.incrementalRandomness) {
          nextStep += random(0,2);
        } else {
          nextStep = (nextStep + 1) % options.period;
        }
      }
    }
    this.history = unshiftAndSlice(this.history, nextPos, maxLength);
    return nextPos;
  };

};
