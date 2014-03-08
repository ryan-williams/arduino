
Paths = function(options) {

  var colors = options.colors;

  var pathsUpperLeft = { x: 0, y: options.fontSize };
  var pathsLabelLeft = 5;
  var pathsMaxHeight = options.maxBrightness - options.minBrightness;

  this.addPaths = function() {
    var width = parseInt($('#paths').css('width'));
    var pathsGroup = d('#paths').append('g').attr('class', 'paths');
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
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", options.fontSize + "px")
        .attr("fill", '#000')
        .attr('x', pathsLabelLeft)
        .attr('y', acc('y'))
        .text(acc('label'))
    ;
  };

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
              color.history.map(function(value) {
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
