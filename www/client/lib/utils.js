
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
      elems.push(generator(elems[i - 1]));
    }
    return elems;
  },

  spiralWalk: function(x, y, stepMagnitude, num) {
    var t = Math.PI / 2;
    var tvv = 0.0007;
    var initialTV = -.07;
    return this.genArray(
        { x: x, y: y },
        function(prevElem) {
          initialTV -= tvv;
          t += initialTV;
          return {
            x: prevElem.x + stepMagnitude * Math.cos(t),
            y: prevElem.y + stepMagnitude * Math.sin(t)
          }
        },
        num
    );
  },

  wrap: function(x) {
    return function() {
      return x;
    }
  },

  random: function(min, max) {
    return interpolate(Math.random(), 0, 1, min, max);
  },

  planarRandomWalk: function(x, y, stepMagnitude, num) {
    var t = Math.PI / 4;
    var maxDeltaT = .45;
    return genArray(
        { x: x, y: y },
        function(prevElem) {
          var tv = maxDeltaT * (Math.random() * 2 - 1);
          t += tv;
          return {
            x: prevElem.x + stepMagnitude * Math.cos(t),
            y: prevElem.y + stepMagnitude * Math.sin(t)
          }
        },
        num
    );
  },

  interpolate: function(num, min, max, newMin, newMax) {
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

for (k in Utils) {
  window[k] = Utils[k];
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
