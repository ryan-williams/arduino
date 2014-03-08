
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

  walks.map(function(walk, idx) { walk.idx = idx; });

  this.setCurWalk = function(walk) {
    var prevPosition = null;
    if (this.curWalk) {
      prevPosition = this.curWalk.position;
    }
    this.curWalk = walk;
    this.curWalkIdx = walk.idx;

    if (prevPosition != null) this.curWalk.setPosition(prevPosition);
  };

  this.setCurWalkIdx = function(idx) {
    var prevPosition = null;
    if (this.curWalk) {
      prevPosition = this.curWalk.position;
    }
    this.curWalk = walks[idx];
    this.curWalkIdx = idx;

    if (prevPosition != null) this.curWalk.setPosition(prevPosition);
  };

  this.setCurWalk(walks.find(function(walk) { return walk.initd; }) || walks[0]);

  this.incWalkType = function() {
    this.setCurWalkIdx((this.curWalkIdx + 1) % walks.length);
  };

  this.setWalkType = function(walkName) {
    console.log("setting: " + walkName);
    this.setCurWalk(walks.find(function(walk) { return walk.name == walkName; }) || this.curWalk);
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
