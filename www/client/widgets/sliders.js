
var numLineStartY = 30;
var serifHeight = 10;
var leftPad = 10;
var rightPad = 6;

var rgb = {r:0,g:1,b:2};

Sliders = function(options) {
  this.colors = options.colors;
  var fontSize = options.fontSize;
  var minBrightness = options.minBrightness;
  var maxBrightness = options.maxBrightness;

  function getNumLineData(colorWalk) {
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
              fn: function() {
                return colorWalk.position;
              },
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

  this.addNumLineLines = function() {
    this.svgs
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
  };

  this.addNumLineSliderCircles = function() {

    this.svgs
        .selectAll('g.numlines')
        .selectAll('circle')
        .data(function(d, i) {
          return [{
            fn: function() {
              return d.colorWalk.position;
            },
            cx: d.lines[1].start.x,
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
        .attr('cx', acc('cx'))
        .attr('cy', function(d) {
          return Math.floor(d.cy);
        })
    ;
  };

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
    var numLines = this.colors.map(function(color) { return getNumLineData(color); });

    d('.sliders')
        .selectAll('div.slider-div.svg-div')
        .data(numLines)
        .enter()
        .append('div')
        .attr('class', 'slider-div svg-div row')
    ;

    var sliderDivs =
            d('.sliders')
                .selectAll('div.slider-div.svg-div')
        ;

    sliderDivs
        .selectAll('div.span3')
        .data(function(d) { return [d]; })
        .enter()
        .append('div')
        .attr('class', 'span3')
    ;

    var svgDivs =
            sliderDivs
                .selectAll('div.span3')
        ;

    var width = parseInt(svgDivs.style('width'));

    this.svgs =
            svgDivs
                .selectAll('svg.slider')
                .data(function(d) {
                  return [ add(d.elems(width), 'colorWalk', d.colorWalk) ];
                })
    ;
    this.svgs
        .enter()
        .append('svg')
        .attr('class', 'slider')
    ;

    sliderDivs
        .selectAll('div.slider-button-div')
        .data(function(d) { return [d]; })
        .enter()
        .append('div')
        .attr('class', 'slider-button-div')
    ;

    var buttonDivs = sliderDivs.selectAll('div.slider-button-div');

    var buttonTypes = [
      [ 'random-sine', 'rsin' ],
      [ 'sine', 'sin' ],
      [ 'random', 'rnd' ],
      [ 'constant', 'cons' ]
    ];

    buttonDivs
        .selectAll('input.mode')
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
        .attr('class', 'mode')
        .attr('type', 'button')
        .attr('value', acc('label'))
        .on('click', function(d) {
          var idx = rgb[d.colorWalk.abbrev];
          console.log(d);
          console.log("mode " + d.mode + " c: " + d.colorWalk.abbrev + " idx: " + idx);
          var key = idx + '.mode';
          var setObj = {};
          setObj[key] = d.mode;
          Colors.update({_id: id}, { $set: setObj });
        })
    ;

    this.svgs.selectAll('g.numlines').data(arr).enter().append('g').attr('class', 'numlines');

    var numlines =
            this.svgs.selectAll('g.numlines')
                .on('click', function(d) {
                  var logicalX = interpolate(d3.event.offsetX, d.left, d.right, minBrightness, maxBrightness);
                  var setObj = {};
                  var idx = rgb[d.colorWalk.abbrev];
                  setObj[idx + '.newPosition'] = logicalX;
                  Colors.update({_id: id}, { $set: setObj });
                })
        ;

    numlines
        .selectAll('rect.clicker')
        .data(arr)
        .enter()
        .append('rect')
        .attr('class', 'clicker')
        .attr('width', acc('width'))
        .attr('height', 2*serifHeight)
        .attr('fill', '#000')
        .attr('fill-opacity', 0.05)
        .attr('y', numLineStartY - serifHeight)
        .attr('x', acc('left'))
    ;

    this.addNumLineLines();
    this.addNumLineSliderCircles();
    addNumLineLabels();

    return this;
  };

  this.update = function() {
    // Slide number-lines' circle-indicators.
    d3.selectAll('.slider')
        .selectAll('g.numlines')
        .selectAll('circle')
        .attr('cx', function(d, i) {
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
