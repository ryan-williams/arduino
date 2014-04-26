
FpsMonitor = function() {
  var totalTimer = new Timer();
  var secondTimer = new Timer();

  this.checkpoint = function(shouldPrintStatus) {
    totalTimer.checkpoint();
    secondTimer.checkpoint();

    if (totalTimer.justCrossedSecondBoundary) {
      console.log(this.toString());//"total ms/f: %s, this second: %s", totalTimer.toString(), secondTimer.toString());
      secondTimer.clear();
    }
  };

  this.clear = function() {
    totalTimer.clear();
    secondTimer.clear();
  };

  this.toString = function() {
    return "total ms/f: " +  totalTimer.toString() + ", this second: " + secondTimer.toString();
  };
};
