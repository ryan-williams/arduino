
function rgbString(r, g, b) {
  if (r && r.r) {
    return rgbString(r.r, r.g, r.b);
  }
  return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
}

var maxV = 10;
var minAbs = 100;
var maxAbs = 255;

function clamp(num, min, max) {
  return num > max ? max : (num < min ? min : num);
}

var debug = 0;

var numBoxes = 125;

var R = 10;

var svg;
var i;

var pathsUpperLeft = { x: 10, y: 220 };
var pathsMaxHeight = maxAbs - minAbs;
var fontSize = 15;

var pathXScale = 4;

function identity(x) { return x; }
function acc(name) {
  return function(d) {
    name.split('.').map(function(segment) { d = d[segment]; });
    return d;
  };
}
window.acc = acc;

function sliding(arr) {
  var ret = [];
  for (i = 0; i < arr.length - 1; ++i) ret.push([arr[i], arr[i+1]]);
  return ret;
}

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

function pathData(values, xScale) {
  return "M" + values.map(function(value, idx) { return (xScale*idx) + " " + Math.floor(value) }).join(" L");
}

function shift(arr) {
  for (i = arr.length - 1; i > 0; --i) arr[i] = arr[i-1];
}

function zip(arrays) {
  return arrays[0].map(function(_,i){
    return arrays.map(function(array){return array[i]})
  });
}

$(function() {

  Math.seedrandom(3);

  var circleCoords = spiralWalk(550, 300, 2*R + 5, numBoxes);

  var initialColor = { r: maxAbs / 2, g: maxAbs / 2, b: maxAbs / 2 };
  var colors = genArray(
      initialColor,
      function(prev) { return initialColor; },
      numBoxes
  );

  svg = d3.select('#svg');
  svg.selectAll('circle.pixel')
      .data(circleCoords.map(function(coords, i) {
        return {
          coords: coords,
          colorFn: function() { return colors[i]; }
        }
      }))
      .enter()
      .append('circle')
      .attr('class', 'pixel')
      .attr("r", R)
      .attr('cx', function(d) {
        return Math.floor(d.coords.x);
      })
      .attr('cy', function(d) {
        return Math.floor(d.coords.y);
      });

  var numLineWidth = 300;
  var serifHeight = 10;

  function numLine(startPoint, color, updateFn) {
    return {
      updateFn: updateFn,
      color: color,
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
      ],
      labels: {
        currentValue: {
          fn: updateFn,
          x: startPoint.x + 10,
          y: startPoint.y - serifHeight,
          color: '#000'
        },
        minValue: {
          fn: function() { return minAbs; },
          x: startPoint.x - 5,
          y: startPoint.y + serifHeight + fontSize,
          color: color
        },
        maxValue: {
          fn: function() { return maxAbs; },
          x: startPoint.x + numLineWidth - 5,
          y: startPoint.y + serifHeight + fontSize,
          color: color
        }
      }
    }
  }

  var numLines = [
    numLine({ x: 20, y:  50 }, '#F00', function() { return r; }),
    numLine({ x: 20, y: 100 }, '#0F0', function() { return g; }),
    numLine({ x: 20, y: 150 }, '#00F', function() { return b; })
  ];

  svg.selectAll('g.numlines')
      .data(numLines)
      .enter()
      .append('g')
      .attr('class', 'numlines')
      .selectAll('line')
      .data(acc('lines'))
      .enter()
      .append('line')
      .attr('x1', acc('start.x'))
      .attr('y1', acc('start.y'))
      .attr('x2', acc('end.x'))
      .attr('y2', acc('end.y'))
      .style('stroke-width', 2)
      .style('stroke', acc('color'))
  ;

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

  svg.selectAll('g.numlines')
      .selectAll('text')
      .data(function(d) {
        return [ d.labels.currentValue, d.labels.minValue, d.labels.maxValue ]
      })
      .enter()
      .append('text')
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize + "px")
      .attr("fill", acc('color'))
      .attr('x', acc('x'))
      .attr('y', acc('y'));

  svg.selectAll('g.paths')
      .data([[
        {
          pointsFn: function() { return rHistory; },
          x: pathsUpperLeft.x,
          y: pathsUpperLeft.y,
          stroke: '#F00'
        }
        ,{
          pointsFn: function() { return gHistory; },
          x: pathsUpperLeft.x,
          y: pathsUpperLeft.y,
          stroke: '#0F0'
        }
        ,{
          pointsFn: function() { return bHistory; },
          x: pathsUpperLeft.x,
          y: pathsUpperLeft.y,
          stroke: '#00F'
        }
      ]])
      .enter()
      .append('g')
      .attr('class', 'paths')
      .selectAll('path')
      .data(identity)
      .enter()
      .append('path')
      .attr('stroke', acc('stroke'))
      .attr('stroke-width', 2)
      .attr('fill', 'transparent')
  ;

  svg.selectAll('g.paths')
      .selectAll('text')
      .data([
        {
          label: maxAbs,
          y: pathsUpperLeft.y - 5
        },
        {
          label: minAbs,
          y: pathsUpperLeft.y + pathsMaxHeight + fontSize + 5
        }
      ])
      .enter()
      .append('text')
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize + "px")
      .attr("fill", '#000')
      .attr('y', acc('y'))
      .text(acc('label'))
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

  var rHistory = [r];
  var gHistory = [g];
  var bHistory = [b];
  var maxHistory = numBoxes;

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

    rHistory = rHistory.slice(0, maxHistory - 1); rHistory.unshift(r);
    gHistory = gHistory.slice(0, maxHistory - 1); gHistory.unshift(g);
    bHistory = bHistory.slice(0, maxHistory - 1); bHistory.unshift(b);

    shift(colors);
    colors[0] = { r:r, g:g, b:b };
    svg.selectAll('circle.pixel')
        .attr('fill', function(d) { return rgbString(d.colorFn()); })
    ;

    svg.selectAll('g.numlines')
        .selectAll('circle')
        .attr('cx', function(d) {
          return d.minX + (d.maxX - d.minX) * (Math.floor(d.fn()) - minAbs) / (maxAbs - minAbs);
        })
        .attr('cy', function(d) {
          return Math.floor(d.cy);
        })
    ;

    svg.selectAll('g.numlines')
        .selectAll('text')
        .text(function(d) {
          return Math.floor(d.fn());
        })
    ;

    svg.selectAll('g.paths')
        .selectAll('path')
        .attr('d', function(d) {
          return pathData(
              d.pointsFn().map(function(value) {
                return pathsUpperLeft.y + pathsMaxHeight - pathsMaxHeight*(value - minAbs)/(maxAbs - minAbs);
              }),
              pathXScale
          );
        })
  }

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, 20);
  }
  colorLoop();

});

