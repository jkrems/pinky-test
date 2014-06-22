assert = require 'assert'

Bluebird = require 'bluebird'

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
      if process.env.FORCE_FAIL
        Bluebird.reject(new Error 'Functions returning promises are ok')
      else
        # everything should be fine

    swear 'mocha-style done', (done) ->
      setTimeout done, 100
  ]

  # promises are totally fine
  Bluebird.resolve('Any value here')
]
