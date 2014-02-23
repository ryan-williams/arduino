
function rgbString(r, g, b) { return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")"; }

var maxV = 10;
var minAbs = 50;
var maxAbs = 200;

function clamp(num, min, max) {
  return num > max ? max : (num < min ? min : num);
}

var debug = 0;

var numBoxes = 75;

var R = 8;

var svg;
var i;

function genArray(initialVal, generator, num) {
  var elems = [initialVal];
  for (i = 1; i < num; ++i) {
    elems.push(generator(elems[i - 1]));
  }
  return elems;
}

function planarRandomWalk(x, y, stepMagnitude, num) {
  var t = Math.PI / 4;
  var maxDeltaT = .3;
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
}

function shift(arr) {
  for (i = arr.length - 1; i > 0; --i) arr[i] = arr[i-1];
}

$(function() {

  Math.seedrandom(3);

  svg = d3.select('svg');
  for (i = 0; i < numBoxes; ++i) {
    svg.append('circle');
  }

  var circleCoords = planarRandomWalk(100, 100, 2*R + 5, numBoxes);

  var initialColor = { r: maxAbs / 2, g: maxAbs / 2, b: maxAbs / 2 };
  var colors = genArray(initialColor, function(prev) { return { r:0, g:0, b:0 }; }, numBoxes);

  svg.selectAll('circle')
      .attr("r", R)
      .data(circleCoords)
      .attr('cx', function(d,i) {
        return Math.floor(d.x);
      })
      .attr('cy', function(d,i) {
        return Math.floor(d.y);
      });

  var r = maxAbs / 2;
  var g = maxAbs / 2;
  var b = maxAbs / 2;

  var rv = 0;
  var gv = 0;
  var bv = 0;

  var rvv = 0;
  var bvv = 0;
  var gvv = 0;

  function stepColor() {

    rvv = Math.random() - 0.5;
    gvv = Math.random() - 0.5;
    bvv = Math.random() - 0.5;

    rv = clamp(rv + rvv, -maxV, maxV);
    gv = clamp(gv + gvv, -maxV, maxV);
    bv = clamp(bv + bvv, -maxV, maxV);

    r = clamp(r + rv, minAbs, maxAbs);
    g = clamp(g + gv, minAbs, maxAbs);
    b = clamp(b + bv, minAbs, maxAbs);

    if (r >= maxAbs || r <= minAbs) rv = 0;
    if (g >= maxAbs || g <= minAbs) gv = 0;
    if (b >= maxAbs || b <= minAbs) bv = 0;

    shift(colors);
    colors[0] = {r:r,g:g,b:b};
    svg.selectAll('circle')
        .attr('fill', function(d, i) {
          return rgbString(colors[i].r, colors[i].g, colors[i].b);
        });

  }

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, 10);
  }
  colorLoop();

});

