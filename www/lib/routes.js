
Router.map(function() {
  this.route(
      'colors',
      {
        path: '/',
        data: function() {
          var c = Colors.findOne({_id: id});
          return c;
        }
      }
  );
  this.route('hilbert');
});
