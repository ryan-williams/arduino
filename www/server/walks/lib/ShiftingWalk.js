
ShiftingWalk = function() {
//  this.blendWeight = 2;
  this.stepValues = function(values, maxLength) {
    var nextVal = this.step();
    if (!this.blendWeight) {
      return Utils.unshiftAndSlice(values, nextVal, maxLength);
    }
    values[0] = nextVal;
    var prevVal = nextVal;
    for (var i = 1; i < Math.min(values.length + 1, maxLength); ++i) {
      values[i] = (prevVal + ((this.blendWeight * values[i]) || 0)) / (1 + this.blendWeight);
      prevVal = values[i];
    }
    return values;
  };
};
