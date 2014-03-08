
RandomWalk = function(options) {

  this.name = "random";

  var acceleration = 0;
  var velocity = 0;
  this.position = options.initialValue;

  this.setPosition = function(pos) {
    this.position = pos;
  };

  this.step = function() {
    acceleration = random(-options.maxAcceleration, options.maxAcceleration);
    velocity = clamp(velocity + acceleration, -options.maxVelocity, options.maxVelocity);
    this.position = clamp(this.position + velocity, options.minPosition, options.maxPosition);

    if (this.position <= options.minPosition || this.position >= options.maxPosition) velocity = 0;

    return this.position;
  };

};
