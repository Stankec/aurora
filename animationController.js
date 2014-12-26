var fs                = require('fs');
var path              = require('path');
var animitter         = require('animitter');
var adapterController = null

var animate = false;
var fps = 30;
var availableAnimations = [];
var activeAnimations = [];
var currentState = [];
var deviceConfiguration = {
  // Configuration for Adafruit LED pixels
  numberOfLeds: 25
}
var loop = animitter({ fps: 30 }, function(frameCount, deltaTime){
  if (activeAnimations.length != 0) {
    for (var i = activeAnimations.length - 1; i >= 0; i--) {
      activeAnimations[i].tick(currentState)
    };
    updateDevice(currentState)
  } else {
    loop.stop();
  }
});


// Animation loading
function loadAnimations() {
  availableAnimations.length = 0;
  var filepath = path.join(process.cwd(), 'animations')
  var files = fs.readdirSync(filepath)
  for(var i = 0; i < files.length; i++){
    if(files[i].indexOf('.js') > -1){
      var animation = require('./animations/' + files[i].replace('.js', ''))
      availableAnimations.push(animation)
    }
  }
  return availableAnimations
}

function setDefaultAnimation() {
  if (activeAnimations.length == 0 && availableAnimations[0]) {
    activeAnimations.push(availableAnimations[0])
    return activeAnimations[0];
  }
  return false;
}

// Animation loop controll
function startAnimations(animation, fps, targetColor) {
  loop.start();
  console.log(loop.running);
}

function stopAnimations() {
  loop.stop();
}

// Device interaction
function configure(configuration) {
  deviceConfiguration.numberOfLeds = configuration.numberOfLeds;
  updateConfiguration();
}

function updateConfiguration() {
  currentState = [];
  for (var i = deviceConfiguration.numberOfLeds - 1; i >= 0; i--) {
    currentState.push(null);
  };
}

function updateDevice(configuration) {
  adapterController.setState(currentState);
}

function setAdapterController(newAdapterController) {
  if (!newAdapterController) return false;
  adapterController = newAdapterController;
  return adapterController;
}

function animationWithID(animationID) {
  return availableAnimations.filter(function(item){
    return item.id === animationID;
  })[0];
}

function animationIsActive(animationID) {
  return activeAnimations.filter(function(item){
    return item.id === animationID;
  })[0];
}

function removeAnimation(animationID) {
  var animation = animationWithID(animationID);
  if (animation && animationIsActive(animationID)) {
    activeAnimations.pop(animation);
    return true;
  } else {
    return false;
  }
}

function addAnimation(animationID) {
  var animation = animationWithID(animationID);
  if (animation && !animationIsActive(animationID)) {
    var numActiveAnimations = activeAnimations.length;
    activeAnimations.push(animation);
    if (numActiveAnimations == 0) loop.start();
    return true;
  } else {
    return false;
  }
}

// Promote model
function AnimationController() {
}

module.exports = {
  fps: fps,
  availableAnimations: availableAnimations,
  activeAnimations: activeAnimations,
  loadAnimations: loadAnimations,
  start: startAnimations,
  stop: stopAnimations,
  configure: configure,
  configuration: deviceConfiguration,
  updateConfiguration: updateConfiguration,
  setAdapterController: setAdapterController,
  setDefaultAnimation: setDefaultAnimation,
  animationWithID: animationWithID,
  removeAnimation: removeAnimation,
  addAnimation: addAnimation
}
