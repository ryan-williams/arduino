
SineWalk = function(options) {

  this.name = "sine";

  var nextStep = 0;
  if (options.initialRandomness) {
    nextStep = Math.random() * options.period;
  }

  this.setPosition = function(pos, velocity) {
    this.position = pos;
    var forcedSinValue = interpolate(pos, options.minPosition, options.maxPosition, -1, 1);
    var asin = Math.asin(forcedSinValue);
    if (velocity < 0) {
      asin = (Math.PI - asin + 2*Math.PI ) % (2*Math.PI);
    }
    nextStep = interpolate(asin, 0, 2* Math.PI, 0, options.period);
  };

  this.step = function() {
    var prevPosition = this.position;
    this.position = interpolate(
        Math.sin(2 * Math.PI * (nextStep / options.period)),
        -1, 1,
        options.minPosition, options.maxPosition
    );

    this.velocity = this.position - prevPosition;

    if (options.incrementalRandomness) {
      nextStep += random(0, 2);
    } else {
      nextStep = (nextStep + 1) % options.period;
    }
    return this.position;
  };

};

ShiftingWalk.call(SineWalk.prototype);
