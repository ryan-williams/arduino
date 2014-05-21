
FpsMonitor = function(options) {
  var totalTimer = new Timer(options);
  var secondTimer = new Timer();

  this.checkpoint = function(shouldPrintStatus) {
    totalTimer.checkpoint();
    secondTimer.checkpoint();

    if (totalTimer.justCrossedSecondBoundary) {
      console.log(this.toString());
      secondTimer.clear();
    }
  };

  this.timings = function() { return totalTimer.timings; };
  this.lastTimings = function() { return totalTimer.lastTimings; };

  this.clear = function() {
    totalTimer.clear();
    secondTimer.clear();
  };

  this.toString = function() {
    return "total ms/f: " +  totalTimer.toString() + ", this second: " + secondTimer.toString();
  };
};
