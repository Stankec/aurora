var tinycolor = require('tinycolor2');

// Variables
var currentOptions = {
  color: tinycolor('#0f76fa')
}

// Functions
function tick(currentState) {
  for (var i = currentState.length - 1; i >= 0; i--) {
    currentState[i] = currentOptions.color;
  };
}

function changeColor(newColor) {
  options({color: newColor});
}

function options(newOptions) {
  if (typeof newOptions !== 'undefined') {
    for (var key in newOptions) {
      if (currentOptions.hasOwnProperty(key)) {
        if (key === 'color') {
          currentOptions[key] = tinycolor(newOptions[key]);
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
    }
  };
}

// Promote model
module.exports = {
  // These three are necessary
  id: "aurora_solid_color",
  name: "Solid Color",
  options: options,
  tick: tick,
  // The following are optional
  setColor: changeColor
}
