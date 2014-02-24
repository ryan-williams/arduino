
var maxHistoryLength = 125;

ColorWalk = function(options) {

  var acceleration = 0;
  var velocity = 0;
  var position = options.initialValue;
  this.history = [ position ];

  this.step = function() {
    acceleration = random(-options.maxAcceleration, options.maxAcceleration);
    velocity = clamp(velocity + acceleration, -options.maxVelocity, options.maxVelocity);
    position = clamp(position + velocity, options.minPosition, options.maxPosition);

    if (position <= options.minPosition || position >= options.maxPosition) velocity = 0;

    this.history = unshiftAndSlice(this.history, position, maxHistoryLength);

    return position;
  };

};
