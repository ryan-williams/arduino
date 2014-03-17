
Utils = {

  clamp: function(num, min, max) {
    return num > max ? max : (num < min ? min : num);
  },

  rgbString: function(r, g, b) {
    if (r && r.r) {
      return rgbString(r.r, r.g, r.b);
    }
    if (r && r.length && r.length == 3) {
      return rgbString.apply(this, r);
    }
    return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
  },

  identity: function(x) { return x; },
  arr: function(x) { return [x]; },
  acc: function(name) {
    return function(d) {
      name.split('.').map(function(segment) { d = d[segment]; });
      return d;
    };
  },

  genArray: function(initialVal, generator, num) {
    var elems = [initialVal];
    for (i = 1; i < num; ++i) {
      elems.push(generator(elems[i - 1], i));
    }
    return elems;
  },

  mostBy: function(arr, fn, cmp) {
    var m = null;
    arr.map(function(x) {
      if (m == null || cmp(fn(x), fn(m))) m = x;
    });
    return m;
  },

  lt: function(a,b) { return a<b; },
  gt: function(a,b) { return a>b; },

  minBy: function(arr, fn) {
    fn = fn || identity;
    return this.mostBy(arr, fn, lt);
  },

  maxBy: function(arr, fn) {
    fn = fn || identity;
    return this.mostBy(arr, fn, gt);
  },

  min: function() {
    if (arguments[0] instanceof Array) {
      return this.minBy(arguments[0]);
    }
    return this.minBy(Array.prototype.slice.call(arguments, 0));
  },

  max: function(a, b) {
    if (a instanceof Array) {
      return maxBy(a, lt);
    }
    return this.max([a,b]);
  },

  copies: function(val, num) {
    var a = [];
    for (var i = 0; i < num; ++i) a.push(val);
    return a;
  },

  wrap: function(x) {
    return function() {
      return x;
    }
  },

  random: function(min, max) {
    return this.interpolate(Math.random(), 0, 1, min, max);
  },

  interpolate: function(num, min, max, newMin, newMax) {
    if (min == max) return (newMin + newMax) / 2;
    return newMin + (newMax - newMin) * (num - min) / (max - min);
  },

  unshiftAndSlice: function(arr, newElem, maxLength) {
    maxLength = maxLength || arr.length;
    var newArr = arr.slice(0, maxLength - 1);
    newArr.unshift(newElem);
    return newArr;
  },

  pathData: function(values, xScale) {
    return "M" + values.map(function(value, idx) { return Math.floor(xScale*idx) + " " + Math.floor(value) }).join(" L");
  },

  sliding: function(arr) {
    var ret = [];
    for (i = 0; i < arr.length - 1; ++i) ret.push([arr[i], arr[i+1]]);
    return ret;
  },

  zip: function(arrays) {
    return arrays[0].map(function(_,i){
      return arrays.map(function(array){return array[i]})
    });
  },

  d: function(selector) {
    return d3.select(selector);
  },

  keys: function(obj) {
    var arr = [];
    for (k in obj) {
      if (obj.hasOwnProperty(k)) arr.push(k);
    }
    return arr;
  },

  enm: function(obj) {
    var arr = [];
    for (k in obj) {
      if (obj.hasOwnProperty(k)) arr.push([k, obj[k]]);
    }
    return arr;
  },

  dAppend: function(parentSelector, selector, attrMap) {
    var segments = selector.split('.');
    var elemType = segments[0];
    var classes = segments.slice(1);
    var elems =
        parentSelector
            .append(elemType)
            .attr('class', classes.join(' '))
        ;

    return enm(attrMap)
        .reduce(function(selection, kv) {
          return selection.attr(kv[0], kv[1]);
        }, elems);
  },

  add: function(obj, k, v) { obj[k] = v; return obj; }
};

interpolate = Utils.interpolate;
random = Utils.random;
clamp = Utils.clamp;

if (Meteor.isClient) {
  for (k in Utils) {
    window[k] = Utils[k];
  }
}

Array.prototype.find = function(fn) {
  for (var i = 0; i < this.length; ++i) {
    if (fn(this[i]))
      return this[i];
  }
  return null;
};

Array.prototype.addEach = function(k, v) {
  this.map(function(e) {
    e[k] = v;
    return e;
  });
  return this;
};
