var Pixel = require('adafruit_pixel').Pixel;
var lights = new Pixel('/dev/spidev0.0', 25);
lights.all(0, 0, 0);
lights.sync();

function setState(currentState) {
  for (var i = currentState.length - 1; i >= 0; i--) {
    var rgb = currentState[i].toRgb()
    lights.set(i, rgb.r, rgb.g, rgb.b);
  };
  lights.sync();
}

module.exports = {
  name: "adafruit_led_pixels",
  setState: setState
}
