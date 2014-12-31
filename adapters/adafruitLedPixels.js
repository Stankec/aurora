var numLeds = 25;
var Pixel = require('adafruit_pixel').Pixel;
var lights = new Pixel('/dev/spidev0.0', numLeds);
var tinycolor = require('tinycolor2');

// Set all black
lights.all(0, 0, 0);
lights.sync();

function setState(currentState) {
  for (var i = currentState.length - 1; i >= 0; i--) {
    var rgb = currentState[i].toRgb()
    lights.set(i, rgb.r, rgb.g, rgb.b);
  };
  lights.sync();
}

function defaultArray() {
  var a = [];
  for (var i = 0; i < numLeds; i++) {
    a.push(tinycolor('#000000'));
  }
  return a;
}

module.exports = {
  name: "adafruit_led_pixels",
  setState: setState,
  defaultArray: defaultArray()
}
