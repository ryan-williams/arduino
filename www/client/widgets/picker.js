
setPixel = function(imageData, x, y, r, g, b, a) {
  index = (x + y * imageData.width) * 4;
  imageData.data[index+0] = r;
  imageData.data[index+1] = g;
  imageData.data[index+2] = b;
  imageData.data[index+3] = a;
};

getInterpolatedBitNumbers = function(d) {
  var p = new Point();
  var s = 1;
  while (d > 0) {
    p = p.add(new Point(Math.floor(d/4)&1, Math.floor(d/2)&1, d&1).mult(s));
    s *= 2;
    d = Math.floor(d/8);
  }
  return p;
};

Picker = function(options) {

  var $el = options.$el;
  var $elem = $el.find('div.color-picker');
  var $canvas = $el.find('canvas.color-picker');
  var $pickers = $el.find('.color-picker');

  var canvas = $canvas[0];
  this.canvas = canvas;

  var $colorPreview = $('#color-preview');
  var $colorLabel = $('#color-label');

  var canvasWidth = options.width || options.height || 250;
  var canvasHeight = options.height || options.width || 250;
  $canvas.attr('width', canvasWidth);
  $canvas.attr('height', canvasHeight);
  $elem.css('width', canvasWidth);
  $elem.css('height', canvasHeight);

  var width = options.blocks || 512;
  var height = options.blocks || 512;

  var blockWidth = canvasWidth / width;
  var blockHeight = canvasHeight / height;

  var scalingFactor = 256*256*256/width/height;
  var scaleCubeRt = Math.round(Math.pow(scalingFactor, 1/3));
  console.log("scaling factor: %d, cbrt: %d", scalingFactor, scaleCubeRt);

  var lastMouseBlockX = null;
  var lastMouseBlockY = null;

  function getColorForBlock(blockX, blockY, fromMouse) {
    var d = xy2d(blockX, blockY);
    var scaledD = d * scalingFactor;
    var p = d2xyz(scaledD);

    if (fromMouse && (lastMouseBlockX != blockX || lastMouseBlockY != blockY)) {
      console.log("(%d,%d), d: %d, rgb: (%s)", blockX, blockY, d, p.pp());
      lastMouseBlockX = blockX;
      lastMouseBlockY = blockY;
    }
    return p;
  }

  function getColorForMouseEvent(e) {
    var blockX = Math.floor(e.offsetX / blockWidth);
    var blockY = Math.floor(e.offsetY / blockHeight);
    if (0 <= blockX && blockX < width && 0 <= blockY && blockY < height) {
      return getColorForBlock(blockX, blockY, true);
    }
  }

  $pickers.on('mousemove', function(e) {
    var p = getColorForMouseEvent(e);
    if (!p) return;
    var color = rgbString(p.x, p.y, p.z);
    $colorPreview.css('background-color', color);
    $colorLabel.html(rgbHexString(p.x, p.y, p.z) + " (" + p.pp() + ")");
  });

  $pickers.on('click', function(e) {
    var p = getColorForMouseEvent(e);
    if (!p) return;
    console.log("got color: " + rgbString(p.x, p.y, p.z));
    var setObj = {};
    for (idx in ['r', 'g', 'b']) {
      setObj[idx + '.newPosition'] = p[({r:'x',g:'y',b:'z'})['rgb'[idx]]];
    }
    console.log(setObj);
    Colors.update({_id: id}, { $set: setObj });
  });


  this.drawHilbertPicker = function() {
    var c = canvas.getContext('2d');

    var imageData = c.createImageData(canvas.width, canvas.height);

    console.log("drawing..");
    for (var d = 0; d < width*height; d++) {
      if (d % 100000 == 0) {
        console.log("\t%d of %d..", d, width*height);
      }
      var xy = d2xy(d);
      var x = xy.x;
      var y = xy.y;
      var color = getColorForBlock(x, y);

      for (var px = Math.floor(canvas.width * x / width); px < Math.floor(canvas.width * (x+1) / width); px++) {
        for (var py = Math.floor(canvas.height * y / height); py < Math.floor(canvas.height * (y+1) / height); py++) {
          setPixel(imageData, px, py, color.x, color.y, color.z, 255);
        }
      }
    }
    console.log("done");
    c.putImageData(imageData, 0, 0);
  };

  var drawnYet = false;

  this.updateDraw = function(draw) {
    if (draw) {
      $elem.hide();
      if (!drawnYet) {
        this.drawHilbertPicker();
        drawnYet = true;
      }
    } else {
      $canvas.hide();
    }
  };

  this.updateDraw(options.draw);
};
