pinky-test
==========

Promise-first test runner.

```js
var pinky = require('pinky-test');
var swear = pinky.swear;

pinky('my test suite', [
  swear('single test', function() {
    assert.equal(true, true);
  }),
  swear(function() {
    // description is optional, defaults to index in array
  }),
  swear('test grouping', [
    function() {
      // this will use a default description as well
      assert.equal('foo', 'foo');
    },
    swear('nested naming is ok', function() {
      return Bluebird.reject(new Error('Functions returning promises are ok'));
    },
    swear('mocha-style done', function(done) {
      setTimeout(done, 100);
    }
  ]),
  // promises are totally fine
  Bluebird.reject(new Error('Something terrible happened'))
]);
```

Or, coffee-script style:

```coffee
{ pinky, swear } = require 'pinky-test'

pinky 'my test suite', [
  swear 'single test', ->
    assert.equal true, true

  swear ->
    # description is optional, defaults to index in array

  swear 'test grouping', [
    ->
      # this will use a default description as well
      assert.equal 'foo', 'foo'

    swear 'nested naming is ok', ->
      Bluebird.reject(new Error 'Functions returning promises are ok')

    swear 'mocha-style done', (done) ->
      setTimeout done, 100
  ]

  # promises are totally fine
  Bluebird.reject(new Error 'Something terrible happened')
]);
```
