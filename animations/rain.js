var tinycolor = require('tinycolor2');

// Variables
var currentOptions = {
  occurance: 0.33,
  lifeSpan: 4, // seconds
  max: 3,
  fps: 30,
  preset: -1,
  spread: 4
}
var raindrops = [];

// Necessary functions
function tick(currentState) {
  // Kill raindrops if they are too old
  for (var i = raindrops.length - 1; i >= 0; i--) {
    var raindrop = raindrops[i];
    if ((raindrop.age > raindrop.lifeSpan) || (raindrop.spread > raindrop.maxSpread)) {
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
    if (raindrop.age % Math.ceil(raindrop.lifeSpan / raindrop.maxSpread) === 0) {
      raindrop.spread += 1;
    }
    var maxLight = (raindrop.lifeSpan - raindrop.age) / raindrop.lifeSpan;
    var increment = maxLight / raindrop.spread;
    var light = maxLight;
    var startPos = raindrop.position - raindrop.spread;
    var endPos = raindrop.position + raindrop.spread;
    for (var p = startPos; p <= endPos; p++) {
      if (p <= raindrop.position) {
        if (p >= 0 && p < mask.length && light > mask[p]) mask[p] = light;
        light -= increment;
      } else {
        light += increment;
        if (p >= 0 && p < mask.length && light > mask[p]) mask[p] = light;
      }
    }
  }
  // Invert mask
  for (var i = mask.length - 1; i >= 0; i--) {
    mask[i] = (1.0 - mask[i]) * 100;
  }
  // Write
  for (var i = currentState.length - 1; i >= 0; i--) {
    currentState[i] = currentState[i].darken(mask[i]);
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
  var raindrop = {
    age: 0,
    lifeSpan: currentOptions.lifeSpan * currentOptions.fps,
    position: Math.floor(Math.random() * 25),
    maxSpread: Math.floor(currentOptions.spread), //- currentOptions.spread * (Math.random() - 0.5) ),
    spread: 0
  };
  return raindrop;
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
