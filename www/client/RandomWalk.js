
RandomWalk = function(options) {

  var acceleration = 0;
  var velocity = 0;
  var position = options.initialValue;

  this.setPosition = function(pos) {
    position = pos;
  };

  this.step = function() {
    acceleration = random(-options.maxAcceleration, options.maxAcceleration);
    velocity = clamp(velocity + acceleration, -options.maxVelocity, options.maxVelocity);
    position = clamp(position + velocity, options.minPosition, options.maxPosition);

    if (position <= options.minPosition || position >= options.maxPosition) velocity = 0;

    return position;
  };

};
