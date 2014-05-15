
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
  var invalidateLookAhead = options.invalidateLookAhead;
  var onInvalidated = options.onInvalidated;

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
    from = clamp(from - curIdxDelta, 0, arr.length);
    to = clamp(to - curIdxDelta, 0, arr.length);
    return [[ from + curIdxDelta, to + curIdxDelta ], arr.slice(from, to)];
  };

  this.invalidateLookAhead = function() {
    console.log("invalidating lookahead, from %d back to %d", arr.length, curIdx);
    arr = arr.slice(0, curIdx);
    if (onInvalidated) {
      onInvalidated(idx.get());
    }
  };

  this.maybeInvalidateLookAhead = function() {
    if (invalidateLookAhead && invalidateLookAhead()) {
      this.invalidateLookAhead();
    }
  };

  this.maybeGen = function() {
    this.maybeInvalidateLookAhead();
    if (arr.length >= curIdx + genBelow) return;

    var i = 0;
    for (; i < genChunk && arr.length < maxLength; ++i) {
      arr.push(generator());
    }

    var newFrontIdx = Math.max(0, curIdx - keepHistory);
//    console.log(
//        "gen'd %d frames. was [%d,%d) -> [%d,%d) (cur: %d -> %d). dropping %d",
//        i,
//        0, arr.length,
//        curIdxDelta, arr.length + curIdxDelta,
//        curIdx, idx.get(),
//        newFrontIdx
//    );
    arr = arr.slice(newFrontIdx);
    curIdx -= newFrontIdx;
    curIdxDelta += newFrontIdx;
  };

  while (arr.length < genBelow) {
    this.maybeGen();
  }
};

