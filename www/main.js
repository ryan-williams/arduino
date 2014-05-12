
ColorMetaData = [
  {
    abbrev: 'r',
    color: '#F00'
  },
  {
    abbrev: 'g',
    color: '#0F0'
  },
  {
    abbrev: 'b',
    color: '#00F'
  }
];

if (Meteor.isServer) {
  console.log("server...");
  Meteor.startup(function() {
    console.log("starting up...");
    runColorDisplay();
  });
}
