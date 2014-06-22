'use strict';

var assert = require('assert');

var Bluebird = require('bluebird');

var pinky = require('../');

pinky([
  pinky.swear(Bluebird.resolve('this works')),
  pinky.swear('10 is 10', function() {
    assert.equal(10, 10);
  })
]);
