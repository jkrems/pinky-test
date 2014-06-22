#!/usr/bin/env node
'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');

var tests = process.argv[2] || 'test';

var stat = fs.statSync(tests);

if (stat.isDirectory()) {
  tests = tests + '/**/*.js';
}

var pinky = require('./');
var printResults = pinky.printResults;

var collected = [];

function runFiles(remaining) {
  pinky.report = function(err, results) {
    if (err) throw err;
    collected.push(results);

    if (remaining.length > 1) {
      runFiles(remaining.slice(1));
    } else {
      var ok = collected.length > 0;
      collected.forEach(function(result) {
        ok = ok && result.ok;
        printResults([], result);
      });
      if (ok) {
        console.log('all ok');
        process.exit(0);
      } else {
        process.exit(1);
      }
    }
  };

  var nextFile = remaining[0];
  require(path.resolve(nextFile));
}

glob(tests, function(err, files) {
  if (err) throw err;
  if (files.length < 1) {
    throw new Error('No test files found in ' + tests);
  }

  runFiles(files);
});
