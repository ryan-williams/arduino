
Pixels = function(options) {

  var colors = options.colors;
  var pixelWalkStart = { x: 50, y: 250 };
  var numBoxes = 125;
  var R = 10;

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

  this.setCoords = function(coords) {
    d('#pixels')
        .selectAll('circle.pixel')
        .data(coords)
        .enter()
        .append('circle')
        .attr('class', 'pixel')
        .attr("r", R)
        .attr('cx', function(d) {
          return Math.floor(d.x);
        })
        .attr('cy', function(d) {
          return Math.floor(d.y);
        })
    ;
  };

  this.addPixelCircles = function() {
    this.setCoords(spiralWalk(pixelWalkStart.x, pixelWalkStart.y, 2*R + 5, numBoxes));
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
