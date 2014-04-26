
ReactiveArray = function(generator, initialValue) {
  var arr = initialValue || [];
  var idx = new ReactiveInt();
  var curIdx = 0;

  var maxLength = 100;
  var genBelow = 20;
  var genChunk = 1;

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
    from = from || 0;
    to = Math.min(to || arr.length, arr.length);
    return arr.slice(from, to);
  };

  this.maybeGen = function() {
    if (arr.length - curIdx >= genBelow) return;

    var i = 0;
    for (; i < genChunk && arr.length < maxLength; ++i) {
      arr.push(generator());
    }

    //console.log("gen'd %d frames, cur was %d, total down from %d to %d", i, curIdx, arr.length - i, arr.length - curIdx);
    arr = arr.slice(curIdx);
    curIdx = 0;
  }
};

