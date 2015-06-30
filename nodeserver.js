// server.js

// BASE SETUP
// =============================================================================

// call the packages we need

var fs = require('fs');
// var http = require('http');
var express = require('express'); // call express
var app = express(); // define our app using express
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use('/media', express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Pragma, Cache-Control, Expires, If-Modified-Since");
  next();
});
app.use(function noCache(req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  next();
});

function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad('0' + str, max) : str;
}

function generateChecksum(command) {
  var sum = 0;

  for (i = 0; i < command.length; i++) {
    sum += command[i].charCodeAt();
  }

  sum = -(sum % 256) & 0xFF;
  return sum.toString(16).toUpperCase();
}

function generateElkCommand(command) {
  return command + pad(generateChecksum(command), 2) + '\r';
}


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/v1)
router.get('/', function(req, res) {
  res.json({
    message: 'Simple Authenticator API'
  });
});

router.route('/somepath/:someVar')
  .get(function(req, res) {
    res.json({
      message: req.params.someVar
    });
  });

router.route('/status')
  .get(function(req, res) {
    res.json({
      message: 'all sensor status'
    });
  });

router.route('/login')
  .get(function(req, res) {
    console.log('Called login method');
    res.json({
      message: 'successful'
    });
  });

router.route('/login')
  .post(function(req, res) {
    if (req.body.username == 'demo' && req.body.password == 'secret') {
      res.status(200).send({
        message: 'successful'
      });
    } else {
      res.status(400).send({
        message: 'Bad request: Login failed'
      });
    }
  });

router.route('/simulate401')
  .post(function(req, res) {
      res.status(401).send({
        message: 'token expired'
      });
  });


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/v1', router);

// START THE SERVER
// =============================================================================
app.listen(port);
