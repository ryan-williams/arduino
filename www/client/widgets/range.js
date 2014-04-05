
Range = function(options) {
  this.$el = null;
  if (options.selector) {
    this.$el = $(options.selector);
  } else if (options.$el) {
    this.$el = options.$el;
  }

  this.$valueLabel = options.$label;

  this.min = options.min || 0;
  this.max = options.max || 100;
  this.$el.attr('min', this.min);
  this.$el.attr('max', this.max);

  this.valueToRawValue = options.v2r || identity;
  this.rawValueToValue = options.r2v || identity;

  this.maybeSetLabel = function() {
    if (this.$valueLabel) {
      this.$valueLabel.html(Math.floor(this.value));
    }
  };

  this.updateElems = function() {
    this.$el[0].value = this.rawValue;
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

  if (options.valueSubscribeFn) {
    Deps.autorun(function() {
      var value = options.valueSubscribeFn();
      this.setValue(value);
    }.bind(this));
  }

  this.offsetXToRawValue = function(offsetX) {
    var minValue = parseInt(this.min);
    var maxValue = parseInt(this.max);
    return interpolate(offsetX, 0, this.$el[0].offsetWidth, minValue, maxValue);
  };

  this.$el.click(function(e) {
    this.setRawValue(this.offsetXToRawValue(e.offsetX));
  }.bind(this));
};
