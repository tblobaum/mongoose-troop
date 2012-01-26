
//  (c) 2012 Tom Blobaum
//  Author: Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Pubsub
// ------

// Dependencies
var mongoose = require('mongoose')
  , objectOrFunction = require('../helpers').objectOrFunction

// Plugin
function pubsub (schema, options) {
  options || (options = {})

  // Options
  var auto = options.auto || false
    , hook = options.hook || 'post'
    , sep = options.seperator || ':'
    , prefix = options.prefix || ''
    , channel = options.channel || false
    , pub = options.publish
    , sub = options.subscribe

  // Automatically publish upon read, save, and remove
  if (auto) {
    ;['init'
    , 'save'
    , 'remove'
    ].forEach(function (method) {
      schema[hook](method, function (next) {
        mongoose.model(this.constructor.modelName).publish(this, {
          method: method
        }, function (err, count) {
          next(err)
        })
      })
      return this
    })
  }

  // Add the publish method to the instance and model
  ;['method'
  , 'static'
  ].forEach(function (key) {
    schema[key]('publish', function (doc, opt, fn) {
      if (arguments.length === 2) {
        fn = opt; opt = {}
      } else if (arguments.length === 1) {
        fn = doc; doc = false; opt = {}
      }
      pub.publish(this.getChannel(), JSON.stringify({
        options: opt
      , data: (doc ? doc : this).toObject()
      }), fn)
      return this
    })
  })

  // Channel extractor for the model and instance
  ;['method'
  , 'static'
  ].forEach(function (key) {
    schema[key]('getChannel', function () {
      var pre = (prefix) ? objectOrFunction(prefix) + sep : ''
        , post = (key === 'method') ? sep + this._id : ''
      
      if (!channel) {
        channel = (this.prototype)
          ? this.prototype.collection.name
          : this.constructor.collection.name
      }
      return pre + objectOrFunction(channel) + post
    })
  })

  // Redis event handling added to the model, should be used with
  // care as to not overload the EventEmitter
  ;['method'
  , 'static'
  ].forEach(function (key) {
    schema[key]('on', function (event, fn) {
      var self = this
      sub.on(event, function (chan, resp) {
        if (chan === self.getChannel()) {
          fn(chan, resp)
        }
      })
      return this
    })
  })

  // Redis method attachment for easy subscriptions to a channel
  ;['subscribe'
  , 'unsubscribe'
  ].forEach(function (method) {
    ;['method'
    , 'static'
    ].forEach(function (key) {
      schema[key](method, function (fn) {
        sub[method](this.getChannel(), function (err, result) {
          fn && fn(err, result)
        })
        return this
      })
    })
  })
}

module.exports = pubsub
