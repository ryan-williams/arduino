
Utils = {

  clamp: function(num, min, max) {
    return num > max ? max : (num < min ? min : num);
  },

  rgbString: function(r, g, b) {
    if (r && r.r) {
      return rgbString(r.r, r.g, r.b);
    }
    return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
  },

  identity: function(x) { return x; },
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
    return "M" + values.map(function(value, idx) { return (xScale*idx) + " " + Math.floor(value) }).join(" L");
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
  }

};

for (k in Utils) {
  window[k] = Utils[k];
}
