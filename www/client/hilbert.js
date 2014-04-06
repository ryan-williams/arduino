
Template.hilbert.rendered = function() {

  var draw = false;

  var width = 512;
  var blocks = 512;

  var picker =
      new Picker({
        selector: '#picker',
        draw: draw,
        width: width,
        blocks: blocks
      });

  var $drawnButton = $('#drawn-button');
  var $cachedButton = $('#cached-button');
  var $saveButton = $('#save-button');
  var $saveLink = $('#save-link');

  var d$radios =
      d3.select('#granularity-radios')
          .append('form')
          .selectAll('input')
          .data([8, 64, 512, 4096])
          .enter()
          .append('div')
          .attr('class', 'radio-container')
          .html(function(d) {
            return '<input type="radio" name="granularity" value="' + d + '" /><span class="radio-label">' + d + '</span>';
          })
          .on('click', function(d) {
            $(this).find('input').click()
          })
          .selectAll('input')
          .data(arr)
          .on('click', function(d) {
            picker.setBlocks(d);
          })
  ;

  function updateButtons() {
    if (draw) {
      $drawnButton.attr('disabled', true);
      $saveButton.attr('disabled', false);
      $cachedButton.attr('disabled', false);
    } else {
      $drawnButton.attr('disabled', false);
      $saveButton.attr('disabled', true);
      $cachedButton.attr('disabled', true);
    }
  }
  updateButtons();

  $drawnButton.click(function(e) {
    draw = true;
    updateButtons();
  });
  $cachedButton.click(function(e) {
    draw = false;
    updateButtons();
  });

  $saveButton.click(function(e) {
    var url = picker.canvas.toDataURL();
    var filename = "hilbert-" + blocks;

    $saveLink.attr('href', url);
    $saveLink.attr('download', filename);
    $saveLink.click();
  });
};
