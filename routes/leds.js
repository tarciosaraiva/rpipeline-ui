var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();

function disconnectLed() {
  ledstrip.fill(0x00, 0x00, 0x00);
  ledstrip.disconnect();
}

function rainbow(buffer, speed) {
  var animationTick = 0.005;
  var angle = 0;
  var ledDistance = 0.3;

  setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      angle = (angle < Math.PI * 2) ? angle : angle - Math.PI * 2;
      for (var i = 0; i < buffer.length; i += 3) {
        //red
        buffer[i] = 128 + Math.sin(angle + (i / 3) * ledDistance) * 128;
        //green
        buffer[i + 1] = 128 + Math.sin(angle * -5 + (i / 3) * ledDistance) * 128;
        //blue
        buffer[i + 2] = 128 + Math.sin(angle * 7 + (i / 3) * ledDistance) * 128;
      }
      ledstrip.sendRgbBuf(buffer);
      angle += animationTick;
    }
  }, speed);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function flash(buffer, speed, colour) {
  var rgb = hexToRgb(colour);
  setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      ledstrip.fill(rgb.r, rgb.g, rgb.b);
      ledstrip.fill(0x00, 0x00, 0x00);
    }
  }, speed);
}

function standard(buffer, speed, colour) {
  var rgb = hexToRgb(colour);
  setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      ledstrip.fill(rgb.r, rgb.g, rgb.b);
      ledstrip.fill(0x00, 0x00, 0x00);
    }
  }, speed);
}

/* GET users listing. */
router.post('/test', function (req, res) {
  var numLEDs = Number(req.param('length'));

  ledstrip.connect(numLEDs);

  // do some fancy stuff
  ledstrip.fill(0xFF, 0x00, 0x00);
  setTimeout(function () {
    ledstrip.fill(0x00, 0xFF, 0x00);
  }, 1000);
  setTimeout(function () {
    ledstrip.fill(0x00, 0x00, 0xFF);
  }, 2000);
  setTimeout(function () {
    ledstrip.fill(0xFF, 0xFF, 0xFF);
  }, 3000);
  setTimeout(function () {
    disconnectLed();
  }, 4000);

  res.send();
});

router.post('/animate', function (req, res) {
  var anim = req.param('animation'),
    colour = req.param('colour'),
    speed = Number(req.param('speed')),
    numLEDs = 24;

  // connecting to SPI
  ledstrip.connect(numLEDs);
  var myDisplayBuffer = new Buffer(numLEDs * 3);

  if (anim === 'rainbow') {
    rainbow(myDisplayBuffer, speed);
  } else if (anim === 'flash') {
    flash(myDisplayBuffer, speed, colour);
  } else {
    standard(myDisplayBuffer, speed, colour);
  }

  setTimeout(function () {
    disconnectLed();
  }, 5000);

  res.send();
});

module.exports = router;