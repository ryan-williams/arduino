
Modes = function(options) {
  this.addButtons = function() {
    var buttonDivs = d3.selectAll('.modes');

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
          console.log("new mode " + d.mode);
          Colors.update({_id: id}, { $set: { mode: d.mode }});
        })
    ;
  };
};
