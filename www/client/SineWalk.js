
var maxLength = 125;

SineWalk = function(options) {

  var nextStep = 0;
  if (options.initialRandomness) {
    nextStep = Math.random() * options.period;
  }
  this.history = [];

  this.step = function() {
    var nextPos = interpolate(
        Math.sin(2 * Math.PI * (nextStep / options.period)),
        -1, 1,
        options.minPosition, options.maxPosition
    );
    if (options.incrementalRandomness) {
      nextStep += random(0,2);
    } else {
      nextStep = (nextStep + 1) % options.period;
    }
    this.history = unshiftAndSlice(this.history, nextPos, maxLength);
    return nextPos;
  };

};
