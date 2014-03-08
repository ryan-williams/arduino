
Pixels = function(options) {

  var colors = options.colors;
  var pixelWalkStart = { x: 50, y: 250 };
  var numBoxes = 125;
  var R = 10;

  this.addPixelCircles = function() {
    var circleCoords = spiralWalk(pixelWalkStart.x, pixelWalkStart.y, 2*R + 5, numBoxes);

    d('#pixels')
        .selectAll('circle.pixel')
        .data(circleCoords)
        .enter()
        .append('circle')
        .attr('class', 'pixel')
        .attr("r", R)
        .attr('cx', function(d) {
          return Math.floor(d.x);
        })
        .attr('cy', function(d) {
          return Math.floor(d.y);
        });

    return this;
  };

  this.update = function() {
    // Update pixels' colors.
    d('#pixels')
        .selectAll('circle.pixel')
        .attr('fill', function(d,i) {
          return rgbString(colors.map(function(color) {
            return color.history[i];
          }))
        })
    ;

  };

};
