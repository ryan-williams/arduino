
Point = function(x, y, z) {
  if (x instanceof Array) {
    y = x[1];
    z = x[2];
    x = x[0];
  }

  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;

  this.n = 4*this.z + 2*this.y + this.x;

  this.mult = function(n) {
    return new Point(this.x*n, this.y*n, this.z*n);
  };

  this.add = function(n) {
    if (n instanceof Number) return new Point(this.x+n, this.y+n, this.z+n);
    return new Point(this.x + n.x, this.y + n.y, this.z + n.z);
  };

  this.rotate = function(regs, n) {
//    console.log("rotate " + this.pp() + " by " + regs.pp() + " (" + regs.n + ")");
    if (regs.n == 0) {
      return this;
    } else if (regs.n == 1 || regs.n == 3) {
      return new Point(this.z, this.x, this.y);
    } else if (regs.n == 2 || regs.n == 6) {
      return new Point(n-this.y, this.z, n-this.x);
    } else if (regs.n == 5 || regs.n == 7) {
      return new Point(n-this.z, n-this.x, this.y);
    } else {  // regs.n == 4
      return new Point(this.x, n-this.y, n-this.z);
    }
  };

  this.rotateLeft = function(n) {
    for (var i = 0; i < (n%3); ++i) {
      var t = this.x;
      this.x = this.y;
      this.y = this.z;
      this.z = t;
    }
    return this;
  };

  this.rotateRight = function(n) {
    for (var i = 0; i < (n%3); ++i) {
      var t = this.z;
      this.z = this.y;
      this.y = this.x;
      this.x = t;
    }
    return this;
  };

  this.pp = function() {
    return [this.x,this.y,this.z].join(',');
  };
};

Picker = function(options) {

  this.d2xyz = function() {
    var args = [].slice.call(arguments);
    if (args.length == 1 && args[0] instanceof Array) {
      args = args[0];
    }
    var points = args.map(function(d) {
//      console.log("** " + d);
      var p = new Point();
      var s = 1;
      var dimensionsRot = 0;
      while (d > 0) {
        var xBit = d & 1;
        var yBit = (d/2) & 1;
        var zBit = (d/4) & 1;

        var regs = new Point(xBit ^ yBit, yBit ^ zBit, zBit);
//        console.log("s: " + s + " p: " + p.pp() + " regs: " + regs.pp() + " dimRot: " + dimensionsRot);
        var rotatedP = p.rotate(regs, Math.floor(s/2));
        var rotatedRegs = regs.rotateLeft(dimensionsRot);
        var multRotatedRegs = rotatedRegs.mult(s);
//        console.log("rotP: " + rotatedP.pp() + " rotatedRegs: " + rotatedRegs.pp() + " mult: " + multRotatedRegs.pp());
        p = rotatedP.add(rotatedRegs.mult(s));

        d = Math.floor(d/8);
        s *= 2;
        dimensionsRot = (dimensionsRot + 1) % 3;
      }
      return p;
    });

    if (points.length == 1) return points[0];
    return points;
  };

  this.prettyD2XYZ = function() {
    var from = 0, to = arguments[0];
    if (arguments.length == 2) {
      from = arguments[0];
      to = arguments[1];
    }
    for (var i = from; i <= to; ++i) {
      var p = this.d2xyz(i);
      console.log(i + ":\t" + p.pp());
    }
  };

  this.xyz2d = function(x, y, z) {

  };


};

d2xyzTestMap = {

};
