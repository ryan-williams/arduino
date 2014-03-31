
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

  var $canvas = options.$canvas;
  var canvas = $canvas[0];

  $canvas.attr('width', options.width || options.height || 250);
  $canvas.attr('height', options.height || options.width || 250);

  var width = options.blocks || 512;
  var height = options.blocks || 512;

  var blockWidth = canvas.width / width;
  var blockHeight = canvas.height / height;

  var scalingFactor = 256*256*256/width/height;

  function getColorForMouseEvent(e) {
    var blockX = e.offsetX / blockWidth;
    var blockY = e.offsetY / blockHeight;
    var d = xy2d(blockX, blockY);
    var scaledD = d*scalingFactor;
//    var p = getInterpolatedBitNumbers(scaledD);
    var p = d2xyz(scaledD);
    return p;
  }

  $canvas.on('mousemove', function(e) {
    var p = getColorForMouseEvent(e);
    var color = rgbString(p.x, p.y, p.z);
    $('#color-preview').css('background-color', color);
    $('#color-label').html(rgbHexString(p.x, p.y, p.z) + " (" + p.pp() + ")");
  });

  $canvas.on('click', function(e) {
    var p = getColorForMouseEvent(e);
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

    log("scaling factor: " + scalingFactor);

    for (var d = 0; d < width*height; d++) {
      var xy = d2xy(d);
      var x = xy.x;
      var y = xy.y;
      var scaledD = d * scalingFactor;
//    var p = getInterpolatedBitNumbers(scaledD);
      var p = d2xyz(scaledD);
      log(x+','+y+':\t'+ d +"\t"+ p.pp());

      for (var px = Math.floor(canvas.width * x / width); px < Math.floor(canvas.width * (x+1) / width); px++) {
        for (var py = Math.floor(canvas.height * y / height); py < Math.floor(canvas.height * (y+1) / height); py++) {
          setPixel(imageData, px, py, p.x, p.y, p.z, 255);
        }
      }
    }

    c.putImageData(imageData, 0, 0);
  };
};
