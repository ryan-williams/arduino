
ReactiveArray = function(options) {
  var arr = [];
  var idx = new ReactiveInt();
  var curIdx = 0;
  var curIdxDelta = idx.get() - curIdx;

  var maxLength = options.maxLength || 200;
  var genBelow = options.genBelow || 20;
  var genChunk = options.genChunk || 1;
  var keepHistory = options.keepHistory || 100;
  var generator = options.generator;

  this.getIdx = function() {
    return idx.get();
  };

  this.advance = function() {
    this.maybeGen();
    curIdx++;
    idx.inc();
    return arr[curIdx];
  };

  this.getCurFrame = function() {
    return arr[curIdx];
  };

  this.get = function(from, to) {
    from -= curIdxDelta;
    to -= curIdxDelta;
//    from = from || 0;
//    to = Math.min(to || arr.length, arr.length);
    return arr.slice(from, to);
  };

  this.maybeGen = function() {
    if (arr.length - curIdx >= genBelow) return;

    var i = 0;
    for (; i < genChunk && arr.length < maxLength; ++i) {
      arr.push(generator());
    }

    var newFrontIdx = Math.max(0, curIdx - keepHistory);
    //console.log("gen'd %d frames, cur was %d, total down from %d to %d", i, curIdx, arr.length - i, arr.length - curIdx);
    arr = arr.slice(newFrontIdx);
    curIdx -= newFrontIdx;
    curIdxDelta = idx.get() - newFrontIdx;
  };

  while (arr.length < genBelow) {
    this.maybeGen();
  }
};

