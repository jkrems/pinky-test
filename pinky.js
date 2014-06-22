'use strict';

var Bluebird = require('bluebird');
var assert = require('assertive');
var formatError = require('format-error').format;

var pendingResultion = [];

function ensureResolution(desc, p) {
  p.pinkyDesc = desc;
  pendingResultion.push(p);
  p.finally(function() {
    var idx = pendingResultion.indexOf(p);
    pendingResultion.splice(idx, 1);
  });
  return p;
}

function makePinkyDesc(stack) {
  return stack.split('\n')[2].replace(/.*\((.+)\)$/, '$1');
}

process.on('exit', function() {
  if (pendingResultion.length > 0) {
    pendingResultion.forEach(function(pending) {
      console.error('Not finished: ' + pending.pinkyDesc);
    });
    throw new Error('Not all tests finished!');
  }
});

function PinkyResult(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      this[key] = obj[key];
  }
  var children = this.children;
  if (Array.isArray(children)) {
    var passed = 0, failed = 0;
    children.forEach(function(result) {
      passed += result.passed;
      failed += result.failed;
    });
    this.passed = passed;
    this.failed = failed;
  }

  this.ok = this.passed > 0 && this.failed === 0;
}

function isArrayOfResult(arr) {
  return Array.isArray(arr) && arr.every(function(el) {
    return el instanceof PinkyResult;
  });
}

PinkyResult.success = function(desc) {
  return function(results) {
    if (isArrayOfResult(results)) {
      return new PinkyResult({
        description: desc,
        children: results
      });
    } else if (results instanceof PinkyResult) {
      return results;
    }
    return new PinkyResult({
      description: desc,
      passed: 1,
      failed: 0
    });
  };
};

PinkyResult.failure = function(desc) {
  return function(err) {
    return new PinkyResult({
      description: desc,
      error: err,
      passed: 0,
      failed: 1
    });
  };
};

function toPromise(desc, fn) {
  if (Array.isArray(fn)) {
    return Bluebird.all(fn.map(function(one, idx) {
      if (one.pinkyDesc === undefined) {
        one.pinkyDesc = '[' + idx + ']';
      }
      return swear(one.pinkyDesc, one);
    }));
  } else if (typeof fn === 'function') {
    if (fn.length === 1) {
      return new Bluebird(function(resolve, reject) {
        return fn(function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      return Bluebird.try(fn);
    }
  }
  return Bluebird.resolve(fn);
}

function swear(desc, swears) {
  if (arguments.length === 1) {
    swears = desc;
    desc = makePinkyDesc(new Error().stack);
  }

  return ensureResolution(desc,
    toPromise(desc, swears)
      .then(PinkyResult.success(desc))
      .catch(PinkyResult.failure(desc))
  );
}

function pinky(desc, swears) {
  var report = pinky.report;
  if (arguments.length === 1) {
    swears = desc;
    desc = makePinkyDesc(new Error().stack);
  }

  if (!Array.isArray(swears)) {
    swears = [swears];
  }

  return swear(desc, swears).nodeify(report);
}

function printResults(path, results) {
  path = path.concat([results.description]);
  if (results.children && results.children.length > 0) {
    results.children.forEach(function(child) {
      printResults(path, child);
    });
  } else {
    if (!results.ok) {
      console.log('not ok: ' + path.join(' '));
      console.log(
        '  ' + formatError(results.error).replace(/\n/g, '\n  ')
      );
    } else if (pinky.verbose || process.env.VERBOSE) {
      console.log('ok: ' + path.join(' '));
    }
  }
}

pinky.report = function(err, results) {
  if (err) throw err;

  if (!results.ok) {
    printResults([], results);
    process.exit(1);
  } else {
    console.log('ok');
    process.exit(0);
  }
};

function wrapAssertProp(fnName) {
  var assertFn = assert[fnName];
  if (typeof assertFn !== 'function') return;
  swear[fnName] = function() {
    var args = Array.prototype.slice.call(arguments);
    var result = Bluebird.all(args).spread(assert[fnName]);
    if (args.length === assertFn.length + 1) {
      return swear(args[0], result);
    } else {
      return swear(makePinkyDesc(new Error().stack), result);
    }
  };
}

for (var fnName in assert) {
  if (assert.hasOwnProperty(fnName)) {
    wrapAssertProp(fnName);
  }
}

module.exports = pinky;
module.exports.default = pinky;
module.exports.pinky = pinky;
module.exports.swear = swear;
module.exports.printResults = printResults;
