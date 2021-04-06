
ArrayUtils = Meteor.require('array-utils');
SerialPort = Meteor.require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyACM0");

serialPort.on("open", function () {
  console.log('**serial port open!');
});

serialWriteColor = function(r, g, b) {
  var bytes = "1" + [r,g,b].map(String.fromCharCode).join('');
  console.log("serial writing: " + r + "," + g + "," + b + ": " + bytes);
  serialPort.write(bytes, function(err, results) {
    console.log('\tserial err: ' + err);
    console.log('\tserial results: ' + results);
  });
};
