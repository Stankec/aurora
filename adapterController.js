var fs    = require('fs');
var path  = require('path');

var availableAdapters = [];
var currentAdatper = null;

function loadAdapters() {
  availableAdapters.length = 0;
  var filepath = path.join(process.cwd(), 'adapters');
  var files = fs.readdirSync(filepath);
  for(var i = 0; i < files.length; i++){
    if(files[i].indexOf('.js') > -1){
      var animation = require('./adapters/' + files[i].replace('.js', ''));
      availableAdapters.push(animation);
    }
  }
  return availableAdapters
}

function setAdapter(adapter) {
  if (typeof adapter === "object") {
    adapter = adapter.name;
  }
  if (!adapter) return null;
  var newAdapter = findAdapterByName(adapter)
  if (!newAdapter) return null;
  currentAdatper = newAdapter;
  return currentAdatper;
}

function findAdapterByName(adapterName) {
  return availableAdapters.filter(function(item){
    return item.name === adapterName;
  })[0];
}

function setDefaultAdapter() {
  if (currentAdatper && findAdapterByName(currentAdatper.name)) return true;
  var newAdapter = availableAdapters[0];
  if (!newAdapter) return false;
  currentAdatper = newAdapter;
  return true;
}

function setState(currentState) {
  if (!currentAdatper) return false;
  return currentAdatper.setState(currentState);
}

function getCurrentAdapter() {
  return currentAdatper;
}

module.exports = {
  availableAdapters: availableAdapters,
  currentAdatper: getCurrentAdapter,
  loadAdapters: loadAdapters,
  setAdapter: setAdapter,
  setDefaultAdapter: setDefaultAdapter,
  setState: setState
}
