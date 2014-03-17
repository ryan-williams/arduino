
Colors = new Meteor.Collection("colors");
Paused = new Meteor.Collection("paused");
Walks = new Meteor.Collection("walks");

id = "abcd";

getColorRecord = function() {
  return Colors.findOne({_id: id});
};

isPaused = function() {
  return !!(Paused.findOne({_id: id}) || {}).paused;
};

togglePaused = function() {
  var paused = isPaused();
  console.log("togglePaused from " + paused + " to " + !paused);
  Paused.update({_id:id}, {$set: {paused: !paused}});
};

