var tinycolor = require('tinycolor2');

// Variables
var currentOptions = {
  color: tinycolor('#0f76fa'),
  speed: 1,
  lightness: 50
}

// Functions
function tick(currentState) {
  for (var i = 0; i < currentState.length; i++) {
    var newColor = currentOptions.color.spin( (360 / currentState.length) * currentOptions.speed).toString();
    currentState[i] = tinycolor(newColor);
  };
}

function options(newOptions) {
  if (typeof newOptions !== 'undefined') {
    for (var key in newOptions) {
      if (currentOptions.hasOwnProperty(key)) {
        if (key === 'color') {
          currentOptions[key] = tinycolor(newOptions[key]);
        } else if (key === 'speed') {
          if (newOptions[key] === 0) newOptions[key] = 1;
          currentOptions[key] = newOptions[key];
        } else if (key === 'lightness') {
          currentOptions[key] = newOptions[key];
          var currentHsl = currentOptions.color.toHsl();
          currentHsl.l = newOptions[key];
          currentOptions.color = tinycolor(currentHsl);
        } else {
          currentOptions[key] = newOptions[key];
        }
      }
    }
  }
  return {
    color: {
      rgba: currentOptions.color.toRgb(),
      hsl: currentOptions.color.toHsl(),
      hsv: currentOptions.color.toHsv(),
      hex: currentOptions.color.toHexString()
    },
    speed: currentOptions.speed
  };
}

// Promote model
module.exports = {
  // These three are necessary
  id: "aurora_color_wheel",
  name: "Color Wheel",
  options: options,
  tick: tick
}
