
var defaultMaxLength = 125;

ColorWalks = function(options) {

  var walks = [];

  this.maxLength = options.maxLength || defaultMaxLength;

  this.color = options.color;

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
    var prevPosition = null;
    if (this.curWalk) {
      prevPosition = this.curWalk.position;
    }
    this.curWalk = walks[idx];
    this.curWalkIdx = idx;

    if (prevPosition != null) this.curWalk.setPosition(prevPosition);
  };

  this.setCurWalkIdx(walks.find(function(walk) { return walk.initd; }) || 0);

  this.incWalkType = function() {
    this.setCurWalkIdx((this.curWalkIdx + 1) % walks.length);
  };

  this.history = [];
  this.position = null;

  this.setPosition = function(pos) { this.curWalk.setPosition(pos); };

  this.step = function() {
    this.position = this.curWalk.step();
    this.history = unshiftAndSlice(this.history, this.position, this.maxLength);
    return this.position;
  };

};
