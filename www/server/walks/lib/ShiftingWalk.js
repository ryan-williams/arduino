
ShiftingWalk = function() {
  this.stepValues = function(values, maxLength, blendWeight) {
    var nextVal = this.step();
    if (!blendWeight) {
      return Utils.unshiftAndSlice(values, nextVal, maxLength);
    }
    values[0] = nextVal;
    var prevVal = nextVal;
    for (var i = 1; i < Math.min(values.length + 1, maxLength); ++i) {
      values[i] = (prevVal + ((blendWeight * values[i]) || 0)) / (1 + blendWeight);
      prevVal = values[i];
    }
    return values;
  };
};
