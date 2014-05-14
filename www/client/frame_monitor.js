
FrameMonitor = function() {
  var prevFrameIdx = -1;
  var lastFrameReset = 0;
  var totalMissedFrames = 0;
  var lastSkipTop = 0;

  this.reset = function(frameIdx) {
    lastFrameReset = frameIdx;
    totalMissedFrames = 0;
    lastSkipTop = 0;
  };

  this.logFrame = function(frameIdx) {
    if (prevFrameIdx != -1) {
      var framesMissed = frameIdx - (prevFrameIdx + 1);
      if (framesMissed > 0) {
        console.log(
            "\t%c+%d,%c-%d: %c%d -> %d. ratio: %s (%d/%d)",
            'color:green',
            (frameIdx - lastSkipTop),
            'color:red',
            framesMissed,
            'color:black',
            prevFrameIdx,
            frameIdx,
            frameIdx == 0 ? "???" : (totalMissedFrames / (frameIdx - lastFrameReset)).toFixed(2),
            totalMissedFrames,
            (frameIdx - lastFrameReset)
        );
        lastSkipTop = frameIdx;
        totalMissedFrames += framesMissed;
      } else if (framesMissed < -1) {
        console.error("wtf? redid frame %d, was at %d", frameIdx, prevFrameIdx);
        if (frameIdx == 1) {
          this.reset(frameIdx);
        }
      }
    }
    prevFrameIdx = frameIdx;
  }
};
