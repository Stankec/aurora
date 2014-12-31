var tinycolor = require('tinycolor2');

// Variables
var currentOptions = {
  occurance: 0.33,
  lifeSpan: 2, // seconds
  max: 5,
  fps: 24,
  preset: -1,
  spread: 3
}
var raindrops = [];

// Necessary functions
function tick(currentState) {
  // Kill raindrops if they are too old
  for (var i = raindrops.length - 1; i >= 0; i--) {
    var raindrop = raindrops[i];
    if ((raindrop.age > raindrop.lifeSpan) || (raindrop.spread >= raindrop.maxSpread)) {
      raindrops.splice(i, 1);
    }
  }
  // Check if we have enough raindrops
  if (raindrops.length < currentOptions.max) {
    if (Math.random() < currentOptions.occurance) {
      raindrops.push(newRaindrop());
    }
  }
  // Generate raindrops mask
  // New empty mask
  var mask = [];
  for (var i = currentState.length - 1; i >= 0; i--) {
    mask.push(0.0);
  };
  // Fill mask
  for (var i = raindrops.length - 1; i >= 0; i--) {
    var raindrop = raindrops[i];
    if (raindrop.age % Math.ceil(raindrop.maxSpread / raindrop.lifeSpan) === 0) {
      raindrop.spread++;
    }
    var maxLight = (raindrop.lifeSpan - raindrop.age) / raindrop.lifeSpan;
    var increment = maxLight / raindrop.spread;
    var light = maxLight;
    var startPos = raindrop.position - raindrop.spread;
    var endPos = raindrop.position + raindrop.spread;
    if (startPos < 0) startPos = 0;
    if (endPos >= raindrops.length) endPos = raindrops.length - 1;
    for (var p = startPos; p <= endPos, p++) {
      if (p <= raindrop.position) {
        mask[p] = light;
        light -= increment;
      } else {
        light += increment;
        mask[p] = light;
      }
    }
  }
  // Invert mask
  for (var i = mask.length - 1; i >= 0; i--) {
    mask[i] = (1.0 - mask[i]) * 100;
  }
  // Write
  for (var i = currentState.length - 1; i >= 0; i--) {
    currentState[i] = tinycolor(currentState[i].toString()).darken(mask[i]);
  };
}

function options(newOptions) {
  if (typeof newOptions !== 'undefined') {
    for (var key in newOptions) {
      if (currentOptions.hasOwnProperty(key)) {
        if (key === 'preset') {
          currentOptions[key] = newOptions[key];
          setPreset(newOptions[key]);
        } else {
          currentOptions[key] = newOptions[key];
        }
      }
    }
  }
  return {
    occurance: currentOptions.occurance,
    lifeSpan: currentOptions.lifeSpan,
    fps: currentOptions.fps,
    preset: currentOptions.preset,
    spread: currentOptions.spread
  };
}

// Support functions
function newRaindrop() {
  return {
    age: 0,
    lifeSpan: currentOptions.lifeSpan * currentOptions.fps,
    position: Math.floor(Math.random() * 25),
    maxSpread: Math.floor(currentOptions.spread * (Math.random() - 0.5) ),
    spread: 0
  }
}

function setPreset(presetId) {

}

// Promote model
module.exports = {
  // These three are necessary
  id: "aurora_rain",
  name: "Rain",
  adapter: ["adafruit_led_pixels"],
  options: options,
  tick: tick
}
