
Trail = function(options) {

  var frames = options.frames.reverse();
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

    var width = Math.ceil(trailWidth / maxLength);

    d('#trail')
        .selectAll('g.trail')
        .selectAll('rect')
        .data(frames)
        .enter()
        .append('rect')
    ;
    d('#trail')
        .selectAll('g.trail')
        .selectAll('rect')
        .attr('width', width)
        .attr('height', rectHeight)
        .attr('x', function(d,i) { return Math.floor(i * width); })
        .attr('fill', rgbString)
    ;
  };

};
