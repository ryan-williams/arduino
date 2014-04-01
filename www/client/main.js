
var defaultMaxLength = 256;
var minBrightness = 0;
var maxBrightness = 255;

var i;

var fontSize = 15;

Template.colors.rendered = function() {

  Math.seedrandom(3);

  var standardOpts = {
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness,
    maxLength: defaultMaxLength
  };

  var firstTime = false;

  Deps.autorun(function() {
    var c = getColorRecord();
    if (c && c[0]) {
      var colors = [c[0], c[1], c[2]];
      standardOpts.colors = colors;
      new Sliders(standardOpts).addNumLines().update();
      new Paths(standardOpts).addPaths().update();
      new Trail(standardOpts).addColorTrail().update();
      var pixels = new Pixels(standardOpts).addPixelCircles().update();
      if (!firstTime) {
        firstTime = true;
        pixels.setSpiralCoords();
      }
      var speed = c.speed;
      $('.cur-speed-label').html(speed);
      var input = $('.speed-slider-div input')[0];
      var logSpeed = Math.log(speed);
      var logMin = Math.log(input.min);
      var logMax = Math.log(input.max);
      input.value = interpolate(logSpeed, logMin, logMax, parseInt(input.min), parseInt(input.max));

    }
  });

  new Picker({
    $canvas: $('#color-picker'),
    width: 300,
    height: 300
  });

  new Modes().addButtons();

  d3.selectAll('#pause-button')
      .on('click', togglePaused);

  d3.selectAll('#step-button')
      .on('click', function(d) {
        Paused.update({_id: id}, {$set: {step: true, paused: true}});
      });

  d3.select('body')
      .on('keydown', function(d) {
        var keyId = d3.event.keyIdentifier;
        var keyCode = d3.event.keyCode;
        if (keyId == 'Right') {
          Paused.update({_id: id}, {$set: {step: true, paused: true}});
        }
        if (keyCode == 32) {
          togglePaused();
          d3.event.preventDefault();
        }
      });

  console.log("rendered 'colors'...");
  d3.select('.speed-slider-div input')
      .on('click', function(d) {
        var input = $('.speed-slider-div input')[0];
        var minValue = parseInt(input.min);
        var maxValue = parseInt(input.max);
        var rawValue = interpolate(d3.event.offsetX, 0, input.offsetWidth, minValue, maxValue);
        var newSpeed =
            Math.floor(
                Math.exp(
                    interpolate(rawValue, minValue, maxValue, Math.log(minValue), Math.log(maxValue))
                )
            );
        console.log("sending down new speed: " + newSpeed);
        Colors.update({_id: id}, { $set: { speed: newSpeed }});
        $('.cur-speed-label').html(newSpeed);
      })
  ;
};
