
ReactiveInt = function(initialValue) {
  var n = initialValue || 0;
  var dep = new Deps.Dependency;

  this.get = function() {
    dep.depend();
    return n;
  };

  this.set = function(newVal) {
    n = newVal;
    dep.changed();
    return n;
  };

  this.inc = function() {
    return this.set(n + 1);
  }
};
