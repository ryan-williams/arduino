
ColorWalks = function(options) {

  var walks = [];

  this.maxLength = options.maxLength;
  this.abbrev = options.abbrev;
  this.color = options.color;

  if (options.randomSineWalk) {
    walks.push(new RandomSineWalk(options.randomSineWalk));
  }

  if (options.sineWalk) {
    walks.push(new SineWalk(options.sineWalk));
  }

  if (options.randomWalk) {
    walks.push(new RandomWalk(options.randomWalk));
  }

  if (options.constantWalk) {
    walks.push(new ConstantWalk(options.constantWalk));
  }

  var walksMap = {};
  walks.forEach(function(walk, idx) {
    walk.idx = idx;
    walksMap[walk.name] = walk;
  });

  this.setCurWalk = function(walk) {
    var prevPosition = null;
    var prevVelocity = null;
    if (this.curWalk) {
      prevPosition = this.curWalk.position;
      prevVelocity = this.curWalk.velocity;
    }
    this.curWalk = walk;
    this.curWalkIdx = walk.idx;

    if (prevPosition != null) this.curWalk.setPosition(prevPosition, prevVelocity);
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

  this.setCurWalk(walks[0]);

  this.incWalkType = function() {
    this.setCurWalkIdx((this.curWalkIdx + 1) % walks.length);
  };

  this.setWalkType = function(walkName) {
//    console.log("setting: " + walkName);
    if (!walksMap[walkName]) {
      throw Error("Bad walk name: " + walkName);
    }
    this.setCurWalk(walksMap[walkName]);
  };

  this.maybeUpdateMode = function(newMode) {
//    console.log("maybe update mode: " + newMode);
    if (!newMode) return;
    if (newMode != this.curWalk.name) {
      console.log("updating mode from " + this.curWalk.name + " to " + newMode);
      this.setWalkType(newMode);
    }
  };

  this.history = [];
  this.position = null;
  this.velocity = null;

  this.setPosition = function(pos) {
    this.curWalk.setPosition(pos, this.curWalk.velocity);
  };

  this.step = function() {
    this.position = this.curWalk.step();
    this.velocity = this.curWalk.velocity;
    this.history = Utils.unshiftAndSlice(this.history, this.position, this.maxLength);
    return this.position;
  };

};