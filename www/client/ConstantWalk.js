
ConstantWalk = function(options) {
  this.position = options.value;
  this.setPosition = function(pos) {
    this.position = pos;
  };
  this.step = function() {
    return this.position;
  };
};
