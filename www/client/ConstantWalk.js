
ConstantWalk = function(options) {
  var position = options.value;
  this.setPosition = function(pos) {
    position = pos;
  };
  this.step = function() {
    return position;
  };
};
