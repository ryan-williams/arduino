
Averager = function() {
  var sum = 0;
  var n = 0;

  this.add = function(v) {
    sum += n;
    n++;
  };

  this.avg = function() {
    return Math.floor(sum / n);
  };

  this.clear = function() {
    this.sum = 0;
    this.n = 0;
  };

};
