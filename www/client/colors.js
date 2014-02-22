
function rgbString(r, g, b) { return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")"; }

var maxV = 10;
var minAbs = 0;
var maxAbs = 100;

function clamp(num, min, max) {
  return num > max ? max : (num < min ? min : num);
}

var debug = 0;

var numBoxes = 100;

$(function() {

  var colorBoxContainer = $('#colorboxen');
  var i;
  for (i = 0; i < numBoxes; ++i) {
    colorBoxContainer.append('<div class="colorbox"></div>');
  }

  var colorBoxen = $('.colorbox');
  colorBoxen = colorBoxen.map(function(i) { return $(colorBoxen[i]); });
  var firstBox = colorBoxen[0];

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
    for (i = numBoxes - 1; i > 0; --i) {
      colorBoxen[i].css('background-color', colorBoxen[i-1].css('background-color'));
    }

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

    if (debug) {
      console.log(rgbString(r,g,b));
    }
    firstBox.css('background-color', rgbString(r, g, b));
  }

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, 10);
  }
  colorLoop();

});

