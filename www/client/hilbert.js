
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

  var $granularitySlider = $('#granularity-slider');
  var granularitySlider = new Range({
    $el: $granularitySlider,
    min: 0,
    max: 8
  });

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
