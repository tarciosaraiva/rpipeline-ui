'use strict';

var express = require('express');
var path = require('path');
var winston = require('winston');
var eWinston = require('express-winston');
var bodyParser = require('body-parser');
var Queue = require('./lib/queue');
var conf = require('./lib/config');
var ledstrip = require('./lib/ledstrip');

// routes
var routes = require('./routes/index');
var leds = require('./routes/leds');
var pipelines = require('./routes/pipelines');
var sounds = require('./routes/sounds');
var queue = require('./routes/queue');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use(eWinston.logger({
  transports: [
    new winston.transports.File({
      filename: 'logs/access.log',
      handleExceptions: false,
      json: false
    })
  ],
  level: 'info',
  statusLevels: true
}));

app.use('/', routes);
app.use('/api/leds', leds);
app.use('/api/sounds', sounds);
app.use('/api/pipelines', pipelines);
app.use('/api/queue', queue);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// poll for messages in the queue
var intervalId = setInterval(function () {
  if (conf.get('queue')) {
    clearInterval(intervalId);
    var q = new Queue();
    q.poll();
  }
}, 1000);

ledstrip.connect();
ledstrip.disconnect();

module.exports = app;