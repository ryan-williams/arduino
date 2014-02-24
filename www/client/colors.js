
var stepTimeMS = 20;
var maxV = 10;
var minBrightness = 100;
var maxBrightness = 255;

var debug = 0;

var numBoxes = 125;

var R = 10;

var svg,i;

var fontSize = 15;

var pathXScale = 4;

var numLineStartY = 30;
var numLineHeight = 60;
var numLinesEndY = numLineStartY + 3*numLineHeight;
var numLineWidth = 300;
var serifHeight = 10;

var pathsUpperLeft = { x: 10, y: numLinesEndY + 10 };
var pathsMaxHeight = maxBrightness - minBrightness;

var initialColor = {
  r: (minBrightness + maxBrightness) / 2,
  g: (minBrightness + maxBrightness) / 2,
  b: (minBrightness + maxBrightness) / 2
};

var colors;
var r, g, b;
var rHistory, gHistory, bHistory;

var maxHistory = numBoxes;

var rv, gv, bv;
var rvv, gvv, bvv;


function addPixelCircles() {
  var circleCoords = spiralWalk(550, 300, 2*R + 5, numBoxes);

  colors = genArray(
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
}

function getNumLineData(startPoint, color, updateFn) {
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
        fn: function() { return minBrightness; },
        x: startPoint.x - 5,
        y: startPoint.y + serifHeight + fontSize,
        color: color
      },
      maxValue: {
        fn: function() { return maxBrightness; },
        x: startPoint.x + numLineWidth - 5,
        y: startPoint.y + serifHeight + fontSize,
        color: color
      }
    }
  }
}

function addNumLineLines() {
  svg.selectAll('g.numlines')
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
}

function addNumLineSliderCircles() {
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
      .attr('cy', function(d) {
        return Math.floor(d.cy);
      })
  ;
}

function addNumLineLabels() {
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
}

function addNumLines() {
  var numLines = [
    getNumLineData({ x: 20, y: numLineStartY }, '#F00', function() { return r; }),
    getNumLineData({ x: 20, y: numLineStartY + numLineHeight }, '#0F0', function() { return g; }),
    getNumLineData({ x: 20, y: numLineStartY + 2*numLineHeight }, '#00F', function() { return b; })
  ];

  svg.selectAll('g.numlines')
      .data(numLines)
      .enter()
      .append('g')
      .attr('class', 'numlines')
  ;

  addNumLineLines();
  addNumLineSliderCircles();
  addNumLineLabels();
}

function appendPathGroup() {
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
  ;
}

function appendPaths() {
  svg.selectAll('g.paths')
      .selectAll('path')
      .data(identity)
      .enter()
      .append('path')
      .attr('stroke', acc('stroke'))
      .attr('stroke-width', 2)
      .attr('fill', 'transparent')
  ;
}

function appendPathLabels() {
  svg.selectAll('g.paths')
      .selectAll('text')
      .data([
        {
          label: maxBrightness,
          y: pathsUpperLeft.y - 5
        },
        {
          label: minBrightness,
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
}

function addPaths() {
  appendPathGroup();
  appendPaths();
  appendPathLabels();
}

function stepColor() {

  rvv = Math.random() - 0.5;
  gvv = Math.random() - 0.5;
  bvv = Math.random() - 0.5;

  rv = clamp(rv + rvv, -maxV, maxV);
  gv = clamp(gv + gvv, -maxV, maxV);
  bv = clamp(bv + bvv, -maxV, maxV);

  r = clamp(r + rv, minBrightness, maxBrightness);
  g = clamp(g + gv, minBrightness, maxBrightness);
  b = clamp(b + bv, minBrightness, maxBrightness);

  if (r >= maxBrightness || r <= minBrightness) rv = 0;
  if (g >= maxBrightness || g <= minBrightness) gv = 0;
  if (b >= maxBrightness || b <= minBrightness) bv = 0;

  rHistory = unshiftAndSlice(rHistory, r, maxHistory);
  gHistory = unshiftAndSlice(gHistory, g, maxHistory);
  bHistory = unshiftAndSlice(bHistory, b, maxHistory);

  colors = unshiftAndSlice(colors, { r:r, g:g, b:b });

  // Update pixels' colors.
  svg.selectAll('circle.pixel')
      .attr('fill', function(d) { return rgbString(d.colorFn()); })
  ;

  // Slide number-lines' circle-indicators.
  svg.selectAll('g.numlines')
      .selectAll('circle')
      .attr('cx', function(d) {
        return interpolate(Math.floor(d.fn()), minBrightness, maxBrightness, d.minX, d.maxX);
      })
  ;

  // Update number-lines' labels.
  svg.selectAll('g.numlines')
      .selectAll('text')
      .text(function(d) {
        return Math.floor(d.fn());
      })
  ;

  // Update color-history paths.
  svg.selectAll('g.paths')
      .selectAll('path')
      .attr('d', function(d) {
        return pathData(
            d.pointsFn().map(function(value) {
              return interpolate(
                  value,
                  minBrightness,
                  maxBrightness,
                  // Tricky: reverse the projected min and max to make higher "value"s map to lower y-values
                  // (a.k.a. higher on screen).
                  pathsUpperLeft.y + pathsMaxHeight,
                  pathsUpperLeft.y
              );
            }),
            pathXScale
        );
      })
  ;
}

window.runColorDisplay = function() {

  Math.seedrandom(3);

  addPixelCircles();
  addNumLines();
  addPaths();

  r = maxBrightness / 2;
  g = maxBrightness / 2;
  b = maxBrightness / 2;

  rv = 0;
  gv = 0;
  bv = 0;

  rvv = 0;
  bvv = 0;
  gvv = 0;

  rHistory = [r];
  gHistory = [g];
  bHistory = [b];

  function colorLoop() {
    stepColor();
    setTimeout(colorLoop, stepTimeMS);
  }
  colorLoop();

};

