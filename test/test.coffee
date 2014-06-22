assert = require 'assert'

Bluebird = require 'bluebird'

{ pinky, swear } = require 'pinky-test'

myBeforeBlock = ->
  Bluebird.resolve 'foo'

pinky 'my test suite', [
  swear 'single test', ->
    assert.equal true, true

  swear.equal 13, 13

  swear ->
    # description is optional, defaults to index in array

  myBeforeBlock().then (preparedValue) ->
    swear 'test grouping', [
      swear.equal 'can use the "before" value', 'foo', preparedValue

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
