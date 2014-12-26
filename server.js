// Set up
var fs                  = require('fs');                    // basic file system operations
var express             = require('express');               // express web framework
var mdns                = require('mdns');                  // bonjour discovery
var app                 = express();                        // create our app w/ express
var layout              = require('express-layout');        // layout engine for express
var morgan              = require('morgan');                // log requests to the console (express4)
var bodyParser          = require('body-parser');           // pull information from HTML POST (express4)
var methodOverride      = require('method-override');       // simulate DELETE and PUT (express4)
var jade                = require('jade');                  // JADE templating engine
var http                = require('http').Server(app);      // http socket of the server
var io                  = require('socket.io')(http);       // web sockets
var sass                = require('node-sass');             // sass compiler
var animationController = require('./animationController'); // animation controller...
var adapterController   = require('./adapterController');   // interfaces with physical device
var serverName          = "Aurora";                         // the server's display name
var serverPort          = 3000;                             // the server's port

// Configuration
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(layout());
app.use(
    sass.middleware({
      src: __dirname + '/public',   // where the sass files are
      dest: __dirname + '/public',  // where css should go
      debug: true                   // obvious
    })
);
app.set('views', './views');
app.set('view engine', 'jade')
app.engine('jade', require('jade').__express);

// Gloabals
app.locals.title = serverName;

// Routes
app.get('/api/animations', function(req, res) {
  animations = {available: [], active: []}
  for (var i = animationController.availableAnimations.length - 1; i >= 0; i--) {
    animations.available.push({
      id: animationController.availableAnimations[i].id,
      name: animationController.availableAnimations[i].name
    });
  };
  for (var i = animationController.activeAnimations.length - 1; i >= 0; i--) {
    animations.active.push({
      id: animationController.activeAnimations[i].id
    });
  };
  res.json(animations);
});

app.get('/api/animations/:id', function(req, res) {
  var animation = animationController.animationWithID(req.params.id);
  if (animation) {
    res.json({
      id: animation.id,
      name: animation.name,
      options: animation.options()
    });
  } else {
    res.status(404);
    res.json({
      id: req.params.id,
      name: "",
      options: {}
    });
  }
});

app.get('/api/animations/:id/view', function(req, res) {
  var animation = animationController.animationWithID(req.params.id);
  if (animation) {
    fs.readFile('views/animations/'+animation.id+'.jade' , 'utf8', function(err, data) {
      if (err) {
        res.json({
          id: animation.id,
          template: ""
        });
      } else {
        res.json({
          id: animation.id,
          template: jade.compile(data)()
        });
      }
    });
  } else {
    res.status(404);
    res.json({
      id: req.params.id,
      template: ""
    });
  }
});

app.get('/', function(req, res) {
  res.render('index', {layout: "layout"});
});

// Sockets
io.on('connection', function(socket){
  console.log('New user connected');

  // Listen for events
  socket.on('animations_update', function(json){
    var responseJson = { added: [], removed: [], order: [], sync: false };
    if (json.removed) {
      for (var i = json.removed.length - 1; i >= 0; i--) {
        if (animationController.removeAnimation(json.removed[i].id)) {
          responseJson.removed.push({id: json.removed[i].id })
        } else {
          responseJson.sync = true;
        }
      };
    }
    if (json.added) {
      for (var i = json.added.length - 1; i >= 0; i--) {
        if (animationController.addAnimation(json.added[i].id)) {
          responseJson.added.push({id: json.added[i].id })
        } else {
          responseJson.sync = true;
        }
      };
    }
    if (json.order) {
      animationController.activeAnimations.sort( function (a, b) {
        return json.order.indexOf(a.id) - json.order.indexOf(b.id);
      });
    }
    animationController.activeAnimations.map(
      function(item) {
        responseJson.order.push(item.id);
      }
    );
    // console.log('animations_update response: '+ JSON.stringify(responseJson));
    socket.broadcast.emit('animations_update', responseJson);
  });
  socket.on('animation_update', function(json){
    var animation = animationController.animationWithID(json.id);
    if (animation) {
      var responseJson = {
        id: animation.id,
        options: animation.options(json.options)
      };
      // console.log('animation_update response: '+ JSON.stringify(responseJson));
      socket.broadcast.emit('animation_update', responseJson);
    }
  });

  socket.on('disconnect', function(){
  });
});

// Start app
http.listen(serverPort, function(){
  console.log('Initializing adapters controller...');
  adapterController.loadAdapters();
  adapterController.setDefaultAdapter();
  console.log(' ' + adapterController.availableAdapters.length + ' adapters loaded');
  console.log(' Using ' + adapterController.currentAdatper().name + ' as default adapter');

  console.log('Initializing animations controller...');
  animationController.setAdapterController(adapterController);
  animationController.updateConfiguration();
  animationController.loadAnimations();
  console.log(' ' + animationController.availableAnimations.length + ' animations loaded.');
  console.log(' Using ' + animationController.setDefaultAnimation().name + ' as default animation')
  animationController.start()

  console.log('Advertising bonjour service...');
  var txtRecord = {
    name: serverName,
    aurora: true,
    api_version: 1
  }
  var ad = mdns.createAdvertisement(
    mdns.makeServiceType('http', 'tcp', 'aurora'),
    serverPort,
    {
      txtRecord: txtRecord
    }
  );
  ad.start();
  console.log(' Advertising as '+ serverName);

  console.log('App listening on *:3000');
});
