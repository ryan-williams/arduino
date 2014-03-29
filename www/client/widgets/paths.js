
Paths = function(options) {

  var colors = options.colors;

  var pathsUpperLeft = { x: 0, y: options.fontSize };
  var pathsLabelLeft = 5;
  var pathsMaxHeight = options.maxBrightness - options.minBrightness;

  this.addPaths = function() {
    var width = parseInt($('#paths').css('width'));

    d3.selectAll('#paths').selectAll('g.paths').data([1]).enter().append('g').attr('class', 'paths');
    var pathsGroup = d3.selectAll('#paths').selectAll('g.paths');

    pathsGroup
        .selectAll('path')
        .data(colors.map(function(color) {
          return {
            colorFn: function() { return color; },
            width: width
          };
        }))
        .enter()
        .append('path')
    ;

    var paths =
        pathsGroup
            .selectAll('path')
            .attr('stroke', function(d) { return d.colorFn().color; })
            .attr('stroke-width', 2)
            .attr('fill', 'transparent')
        ;

    pathsGroup
        .selectAll('text')
        .data([
          {
            label: options.maxBrightness,
            y: pathsUpperLeft.y - 5
          },
          {
            label: options.minBrightness,
            y: pathsUpperLeft.y + pathsMaxHeight + options.fontSize + 5
          }
        ])
        .enter()
        .append('text');

    pathsGroup
        .selectAll('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", options.fontSize + "px")
        .attr("fill", '#000')
        .attr('x', pathsLabelLeft)
        .attr('y', acc('y'))
        .text(acc('label'))
    ;

    return this;
  };

  function pathData(values, xScale) {
    if (values.length == 0) return "M0 0";
    return "M" + values.map(function(value, idx) { return Math.floor(xScale*idx) + " " + Math.floor(value) }).join(" L");
  }

  this.update = function() {
    // Update color-history paths.
    var pathsWidth = parseInt($('#paths').css('width'));
    d('#paths')
        .selectAll('g.paths')
        .selectAll('path')
        .attr('d', function(d) {
          var color = d.colorFn();
          var xScale = pathsWidth / color.maxLength;
          return pathData(
              color.values.map(function(value) {
                return interpolate(
                    value,
                    options.minBrightness,
                    options.maxBrightness,
                    // Tricky: reverse the projected min and max to make higher "value"s map to lower y-values
                    // (a.k.a. higher on screen).
                    pathsUpperLeft.y + pathsMaxHeight,
                    pathsUpperLeft.y
                );
              }),
              xScale
          );
        })
    ;
  };
};
