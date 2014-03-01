
var defaultMaxLength = 125;

ColorWalks = function(options) {

  var walks = [];

  if (options.sineWalk) {
    walks.push(new SineWalk(options.sineWalk));
  }

  if (options.randomWalk) {
    walks.push(new RandomWalk(options.randomWalk));
  }

  if (options.constantWalk) {
    walks.push(new ConstantWalk(options.constantWalk));
  }

  this.setCurWalkIdx = function(idx) {
    this.curWalk = walks[idx];
    this.curWalkIdx = idx;
  };

  this.setCurWalkIdx(walks.find(function(walk) { return walk.initd; }) || 0);

  this.history = [];

  this.setPosition = function(pos) { this.curWalk.setPosition(pos); };

  this.step = function() {
    var nextPos = this.curWalk.step();
    this.history = unshiftAndSlice(this.history, nextPos, options.maxLength || defaultMaxLength);
    return nextPos;
  };

};
