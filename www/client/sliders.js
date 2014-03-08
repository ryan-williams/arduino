
var numLineStartY = 30;
var serifHeight = 10;

Sliders = function(options) {
  var colors = options.colors;
  this.colors = colors;
  var fontSize = options.fontSize;
  var minBrightness = options.minBrightness;
  var maxBrightness = options.maxBrightness;

  function getNumLineData(colorWalk) {
    var leftPad = 5;
    var rightPad = 5;
    return {
      colorWalk: colorWalk,
      elems: function(width) {
        var rightEdge = width - rightPad;
        return {
          left: leftPad,
          right: rightEdge,
          width: rightEdge - leftPad,
          lines: [
            {
              start: { x: leftPad, y: numLineStartY - serifHeight },
              end: { x: leftPad, y: numLineStartY + serifHeight }
            },
            {
              start: { x: leftPad, y: numLineStartY },
              end: { x: rightEdge, y: numLineStartY }
            },
            {
              start: { x: rightEdge, y: numLineStartY - serifHeight },
              end: { x: rightEdge, y: numLineStartY + serifHeight }
            }
          ],
          labels: {
            currentValue: {
              fn: function() { return colorWalk.position; },
              x: 10,
              y: numLineStartY - serifHeight
            },
            minValue: {
              fn: function() { return minBrightness; },
              x: leftPad,
              y: numLineStartY + serifHeight + fontSize
            },
            maxValue: {
              fn: function() { return maxBrightness; },
              x: rightEdge - 25,
              y: numLineStartY + serifHeight + fontSize
            }
          }
        };
      }
    }
  }

  function addNumLineLines() {
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('line')
        .data(function(d) {
          return d.lines.addEach('color', d.colorWalk.color);
        })
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
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('circle')
        .data(function(d) {
          return [{
            fn: function() { return d.colorWalk.position; },
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
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('text')
        .data(function(d) {
          return [
            d.labels.currentValue,
            add(d.labels.minValue, 'color', d.colorWalk.color),
            add(d.labels.maxValue, 'color', d.colorWalk.color)
          ]
        })
        .enter()
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", fontSize + "px")
        .attr("fill", acc('color'))
        .attr('x', acc('x'))
        .attr('y', acc('y'));
  }

  this.addNumLines = function() {
    var numLines = colors.map(function(color) { return getNumLineData(color); });

    var sliderDivs =
            d('.sliders')
                .selectAll('div.slider-div.svg-div')
                .data(numLines)
                .enter()
                .append('div')
                .attr('class', 'slider-div svg-div')
        ;

    var svgDivs = sliderDivs.append('div').attr('class', 'span3');

    var width = parseInt(svgDivs.style('width'));

    var svgs =
            svgDivs
                .selectAll('svg.slider')
                .data(function(d) {
                  return [ add(d.elems(width), 'colorWalk', d.colorWalk) ];
                })
                .enter()
                .append('svg')
                .attr('class', 'slider')
        ;

    var buttonDivs = sliderDivs.append('div');

    var buttonTypes = [
      [ 'random-sine', 'rsin' ],
      [ 'sine', 'sin' ],
      [ 'random', 'rnd' ],
      [ 'constant', 'cons' ]
    ];

    var buttons =
            buttonDivs
                .selectAll('input.pause')
                .data(function(d) {
                  return buttonTypes.map(function(mode) {
                    return {
                      colorWalk: d.colorWalk,
                      mode: mode[0],
                      label: mode[1]
                    };
                  });
                })
                .enter()
                .append('input')
                .attr('class', 'pause')
                .attr('type', 'button')
                .attr('value', acc('label'))
                .on('click', function(d,i) {
                  d.colorWalk.setWalkType(d.mode);
                })
        ;

    var numlines =
            dAppend(svgs, 'g.numlines')
                .on('click', function(d) {
                  var logicalX = interpolate(d3.event.offsetX, d.left, d.right, minBrightness, maxBrightness);
                  d.colorWalk.setPosition(logicalX);
                })
        ;

    var clickerRects =
        dAppend(
            numlines,
            'rect.clicker',
            {
              width: acc('width'),
              height: 2*serifHeight,
              fill: '#000',
              'fill-opacity': 0.05,
              y: numLineStartY - serifHeight,
              x: acc('left')
            }
        );

    addNumLineLines();
    addNumLineSliderCircles();
    addNumLineLabels();
  };


  this.update = function() {
    // Slide number-lines' circle-indicators.
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('circle')
        .attr('cx', function(d) {
          return interpolate(Math.floor(d.fn()), minBrightness, maxBrightness, d.minX, d.maxX);
        })
    ;

    // Update number-lines' labels.
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('text')
        .text(function(d) {
          return Math.floor(d.fn());
        })
    ;
  };

};
