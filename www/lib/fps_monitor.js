
FpsMonitor = function() {
  var totalTimer = new Timer();
  var secondTimer = new Timer();

  var lastSpeed = null;

  this.checkpoint = function(shouldPrintStatus, speed) {
    totalTimer.checkpoint();
    secondTimer.checkpoint();

    if (speed) {
      if (lastSpeed && speed != lastSpeed) {
        this.clear();
      }
      lastSpeed = speed;
    }

    if (totalTimer.justCrossedSecondBoundary) {
      console.log(this.toString());
      secondTimer.clear();
    }
  };

  this.clear = function() {
    totalTimer.clear();
    secondTimer.clear();
    lastSpeed = null;
  };

  this.toString = function() {
    return "total ms/f: " +  totalTimer.toString() + ", this second: " + secondTimer.toString();
  };
};
