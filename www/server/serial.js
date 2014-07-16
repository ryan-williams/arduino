
ArrayUtils = Meteor.require('array-utils');
SerialPort = Meteor.require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyACM0");

serialPort.on("open", function () {
  console.log('**serial port open!');
});

function serialWriteColor(r, g, b) {
  console.log("serial writing: " + r + "," + g + "," + b);
  serialPort.write("1" + [r,g,b].map(String.fromCharCode), function(err, results) {
    console.log('\tserial err: ' + err);
    console.log('\tserial results: ' + results);
  });
}
