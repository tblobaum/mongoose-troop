
/*!
 * Copyright(c) Tom Blobaum
 * Author: Beau Sorensen
 * MIT Licensed
 */

 var mongoose = require('mongoose')

function shim(obj) {
  if (toString.call(obj) == '[object Function]') {
    return obj()
  }
  return obj
}

function pubsub (schema, options) {
  options || (options = {})

  var auto = options.auto || false
    , hook = options.hook || 'post'
    , sep = options.seperator || ':'
    , prefix = options.prefix || ''
    , channel = options.channel || false
    , pub = options.publish
    , sub = options.subscribe

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
    })
  }

  ;['method'
  , 'static'
  ].forEach(function (key) {
    schema[key]('publish', function (doc, opt, fn) {
      if (arguments.length === 2) {
        fn = opt
        opt = {}
      } else if (arguments.length === 1) {
        fn = doc
        doc = false
        opt = {}
      }
      pub.publish(this.getChannel(), JSON.stringify({
        options: opt
      , data: (doc ? doc : this).toObject()
      }), fn)
    })
  })

  ;['method'
  , 'static'
  ].forEach(function (key) {
    schema[key]('getChannel', function () {
      var pre = (prefix) ? shim(prefix) + sep : ''
        , post = (key === 'method') ? sep + this._id : ''
      
      if (!channel) {
        channel = (this.prototype)
          ? this.prototype.collection.name
          : this.constructor.collection.name
      }
      return pre + shim(channel) + post
    })
  })

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
    })
  })

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
      })
    })
  })
}

module.exports = pubsub

