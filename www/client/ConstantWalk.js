
ConstantWalk = function(options) {
  this.name = "constant";
  this.position = options.value;
  this.setPosition = function(pos) {
    this.position = pos;
  };
  this.step = function() {
    return this.position;
  };
};
