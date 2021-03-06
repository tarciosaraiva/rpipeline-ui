'use strict';

var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();
var config = require('./../lib/config');

router.post('/test', function (req, res) {
  var len = Number(req.param('length')),
    start = Number(req.param('start')) || 0,
    end = Number(req.param('end')) || len,
    animation = req.param('animation'),
    speed = Number(req.param('speed')),
    colour = req.param('colour');

  if (start < 1) {
    start = 0;
  }

  if (end > len) {
    end = len - 1;
  }

  if (start > end) {
    res.send(500);
  }

  ledstrip.connect(start, end);
  var intervalId = ledstrip.animate({
    animation: animation,
    speed: speed,
    colour: colour
  });

  setTimeout(function () {
    ledstrip.disconnect();
    clearInterval(intervalId);
  }, 5000);

  res.send();
});

router.get('/', function (req, res) {
  res.json(config.get('leds'));
});

router.put('/', function (req, res) {
  var payload = req.body;
  config.merge('leds', payload);
  config.save(function (err) {
    if (err) {
      res.send(500);
    }
  });
  res.json('Configuration saved successfully.');
});

module.exports = router;