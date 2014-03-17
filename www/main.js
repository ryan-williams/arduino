
if (Meteor.isServer) {
  console.log("server...");
  Meteor.startup(function() {
    console.log("starting up...");
    runColorDisplay();
  });
}
