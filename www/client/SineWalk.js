
SineWalk = function(options) {

  this.name = "sine";

  var nextStep = 0;
  if (options.initialRandomness) {
    nextStep = Math.random() * options.period;
  }

  this.setPosition = function(pos) {
    this.position = pos;
    var forcedSinValue = interpolate(pos, options.minPosition, options.maxPosition, -1, 1);
    nextStep = interpolate(Math.asin(forcedSinValue), 0, 2* Math.PI, 0, options.period);
  };

  this.step = function() {
    this.position = interpolate(
        Math.sin(2 * Math.PI * (nextStep / options.period)),
        -1, 1,
        options.minPosition, options.maxPosition
    );

    if (options.incrementalRandomness) {
      nextStep += random(0,2);
    } else {
      nextStep = (nextStep + 1) % options.period;
    }
    return this.position;
  };

};
