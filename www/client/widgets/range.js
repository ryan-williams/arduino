
Range = function(options) {
  this.$el = options.$el;
  this.$input = this.$el.find('input');
  this.$label = this.$el.find('.slider-cur-label');
  this.$minLabel = this.$el.find('.slider-min-label');
  this.$maxLabel = this.$el.find('.slider-max-label');

  this.min = options.min || 0;
  this.max = options.max || 100;
  this.$input.attr('min', this.min);
  this.$input.attr('max', this.max);

  this.$minLabel.html(this.min);
  this.$maxLabel.html(this.max);

  this.valueToRawValue = options.v2r || identity;
  this.rawValueToValue = options.r2v || identity;

  this.maybeSetLabel = function() {
    if (this.$label) {
      this.$label.html(Math.floor(this.value));
    }
  };

  this.updateElems = function() {
    this.$input[0].value = this.rawValue;
    this.maybeSetLabel();
  };

  this.setValue = function(value) {
    this.value = value;
    this.rawValue = this.valueToRawValue(value);
    this.updateElems();
  };

  this.setRawValue = function(rawValue) {
    this.rawValue = rawValue;
    this.value = this.rawValueToValue(rawValue);
    this.updateElems();
  };

  if (options.value) {
    this.setValue(options.value);
  }

  this.valueSubscribeFn = options.valueSubscribeFn || function() { return 0; };

  this.refreshValue = function() {
    this.setValue(this.valueSubscribeFn());
  };

  Deps.autorun(this.refreshValue.bind(this));

  this.offsetXToRawValue = function(offsetX) {
    var minValue = parseInt(this.min);
    var maxValue = parseInt(this.max);
    return interpolate(offsetX, 0, this.$input[0].offsetWidth, minValue, maxValue);
  };

  this.$input.click(function(e) {
    this.setRawValue(this.offsetXToRawValue(e.offsetX));
  }.bind(this));
};
