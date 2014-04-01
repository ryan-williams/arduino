
ShiftingWalk = function() {
  this.stepValues = function(values) {
    return Utils.unshiftAndSlice(values, this.step(), this.maxLength);
  };
};
