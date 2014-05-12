
Trail = function(options) {

  var colors = options.colors;
  var maxLength = options.maxLength || 256;

  this.addColorTrail = function() {
    d('#trail')
        .selectAll('g.trail')
        .data([1])
        .enter()
        .append('g')
        .attr('class', 'trail');

    return this;
  };

  this.update = function() {
    var trail = $('#trail');
    var trailWidth = parseInt(trail.css('width'));
    var rectHeight = parseInt(trail.css('height'));

    d('#trail')
        .selectAll('g.trail')
        .selectAll('rect')
        .data(colors[0].values.map(function(histElem, elemIdx) {
          return {
            colorValues: colors.map(function(color) { return color.values[elemIdx]; }),
            width: Math.ceil(trailWidth / maxLength)
          };
        }))
        .enter()
        .append('rect')
    ;
    d('#trail')
        .selectAll('g.trail')
        .selectAll('rect')
        .attr('width', acc('width'))
        .attr('height', rectHeight)
        .attr('x', function(d,i) { return Math.floor(i * d.width); })
        .attr('fill', function(d, i) {
          return rgbString(d.colorValues);
        })
    ;
  };

};
