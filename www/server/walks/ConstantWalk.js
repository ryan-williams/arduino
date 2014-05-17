
ConstantWalk = function(options) {
  this.name = "constant";
  this.position = options.position || 0;
  this.velocity = 0;
  this.setPosition = function(pos) {
    this.position = pos;
  };
  this.step = function() {
    return this.position;
  };
};

ShiftingWalk.call(ConstantWalk.prototype);
