
RandomWalk = function(options) {

  this.name = "random";

  var acceleration = 0;
  this.velocity = 0;
  this.position = options.initialValue;

  this.setPosition = function(pos, velocity) {
    this.position = pos;
    this.velocity = velocity;
  };

  this.step = function() {
    acceleration = random(-options.maxAcceleration, options.maxAcceleration);
    this.velocity = clamp(this.velocity + acceleration, -options.maxVelocity, options.maxVelocity);
    this.position = clamp(this.position + this.velocity, options.minPosition, options.maxPosition);

    if (this.position <= options.minPosition || this.position >= options.maxPosition) this.velocity = 0;

    return this.position;
  };

};
