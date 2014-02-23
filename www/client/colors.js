
function rgbString(r, g, b) {
  return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
}

var maxV = 10;
var minAbs = 100;
var maxAbs = 255;

function clamp(num, min, max) {
  return num > max ? max : (num < min ? min : num);
}

var debug = 0;

var numBoxes = 75;

var R = 10;

var svg;
var i;

function genArray(initialVal, generator, num) {
  var elems = [initialVal];
  for (i = 1; i < num; ++i) {
    elems.push(generator(elems[i - 1]));
  }
  return elems;
}

function spiralWalk(x, y, stepMagnitude, num) {
  var t = Math.PI / 2;
  var tvv = 0.0007;
  var initialTV = -.07;
  return genArray(
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
}

function planarRandomWalk(x, y, stepMagnitude, num) {
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
}

function shift(arr) {
  for (i = arr.length - 1; i > 0; --i) arr[i] = arr[i-1];
}

$(function() {

  Math.seedrandom(3);

  var circleCoords = planarRandomWalk(400, 300, 2*R + 5, numBoxes);

  var initialColor = { r: maxAbs / 2, g: maxAbs / 2, b: maxAbs / 2 };
  var colors = genArray(
      initialColor,
      function(prev) { return initialColor; },
      numBoxes
  );

  svg = d3.select('#svg');
  svg.selectAll('circle.pixel')
      .data(circleCoords)
      .enter()
      .append('circle')
      .attr('class', 'pixel')
      .attr("r", R)
      .attr('cx', function(d,i) {
        return Math.floor(d.x);
      })
      .attr('cy', function(d,i) {
        return Math.floor(d.y);
      });

  var numLineWidth = 300;
  var serifHeight = 10;

  function numLine(startPoint, color, updateFn) {
    return {
      updateFn: updateFn,
      lines: [
        {
          start: { x: startPoint.x, y: startPoint.y - serifHeight },
          end: { x: startPoint.x, y: startPoint.y + serifHeight },
          color: color
        },
        {
          start: { x: startPoint.x, y: startPoint.y },
          end: { x: startPoint.x + numLineWidth, y: startPoint.y },
          color: color
        },
        {
          start: { x: startPoint.x + numLineWidth, y: startPoint.y - serifHeight },
          end: { x: startPoint.x + numLineWidth, y: startPoint.y + serifHeight },
          color: color
        }
      ]
    }
  }

  var numLines = [
    numLine({x:20,y: 50}, '#F00', function() { return r; }),
    numLine({x:20,y:100}, '#0F0', function() { return g; }),
    numLine({x:20,y:150}, '#00F', function() { return b; })
  ];

  svg.selectAll('g.numlines')
      .data(numLines)
      .enter()
      .append('g')
      .attr('class', 'numlines')
      .selectAll('line')
      .data(function(d) { return d.lines; })
      .enter()
      .append('line')
      .attr('x1',function(d){return d.start.x;})
      .attr('y1',function(d){return d.start.y;})
      .attr('x2',function(d){return d.end.x;})
      .attr('y2',function(d){return d.end.y;})
      .style('stroke-width', 2)
      .style('stroke', function(d) { return d.color; })
  ;

  function rgb(d,i) {
    console.log(d);
    console.log(i);
    console.log([[r,g,b][i]]);
    return [[r,g,b][i]];
  }

  svg.selectAll('g.numlines')
      .selectAll('circle')
      .data(function(d) {
        return [{
          fn: d.updateFn,
          cy: d.lines[1].start.y,
          minX: d.lines[1].start.x,
          maxX: d.lines[1].end.x
        }];
      })
      .enter()
      .append('circle')
      .attr('class', 'pointer')
      .attr('r', 5)
      .attr('fill', '#000')
  ;

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
    colors[0] = { r:r, g:g, b:b };
    svg.selectAll('circle.pixel')
        .attr('fill', function(d, i) {
          return rgbString(colors[i].r, colors[i].g, colors[i].b);
        });

    svg.selectAll('g.numlines')
        .selectAll('circle')
      .attr('cx', function(d) {
        return d.minX + (d.maxX - d.minX) * (Math.floor(d.fn()) - minAbs) / (maxAbs - minAbs);
      })
      .attr('cy', function(d) {
        return Math.floor(d.cy);
      })
    ;

  }

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, 40);
  }
  colorLoop();

});

