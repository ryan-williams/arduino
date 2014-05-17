
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

  if (options.mode) {
    console.log("got initial mode: " + options.mode);
    this.setCurWalk(walksMap[options.mode]);
  } else {
    console.log("defaulting to mode 0...");
    this.setCurWalkIdx(0);
  }

  this.incWalkType = function() {
    this.setCurWalkIdx((this.curWalkIdx + 1) % walks.length);
  };

  this.setWalkType = function(walkName) {
    if (!walksMap[walkName]) {
      throw Error("Bad walk name: " + walkName);
    }
    this.setCurWalk(walksMap[walkName]);
  };

  this.maybeUpdateMode = function(newMode) {
    if (!newMode) return false;
    if (newMode != this.curWalk.name) {
      console.log("updating mode from " + this.curWalk.name + " to " + newMode);
      this.setWalkType(newMode);
      return true;
    }
    return false;
  };

  this.values = options.values || [];
  this.position = options.position || null;
  this.velocity = options.velocity || null;

  this.setPosition = function(pos) {
    this.curWalk.setPosition(pos, this.curWalk.velocity);
  };

  this.blendWeight = 0;
  BlendWeights.find({_id:id}).observe({
    changed: function(nr) {
      var newValue = (nr && nr.v) || 0;
      this.blendWeight = newValue;
    }.bind(this)
  });

  this.step = function() {
    this.values = this.curWalk.stepValues(this.values, this.maxLength, this.blendWeight);
    this.position = this.curWalk.position;
    this.velocity = this.curWalk.velocity;
    return this.position;
  };

};
