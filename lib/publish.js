
/*!
 * Copyright(c) Tom Blobaum
 * Contributors: Beau Sorensen
 * MIT Licensed
 */

function shim(obj) {
  if (toString.call(obj) == '[object Function]') {
    return obj()
  }
  return obj
}

module.exports = function(schema, options) {
  options || (options = {})

  var auto = (options.auto || false)
    , hook = (option.hook || 'post')
    , sep = (options.seperator || ':')
    , prefix = (options.prefix || '')
    , channel = (options.channel || schema.constructor.modelName)
    , pub = options.publish
    , sub = options.subscribe

  if (auto) {
    ;['init'
    , 'save'
    , 'remove'
    ].forEach(function(method) {
     schema[hook](method, function(next) {
        this.publish({method: method})
        next()
      })
    })
  }

  schema.method('publish', function(opt) {
    opt || (opt = {})
    pub.publish(this.getChannel(), JSON.stringify({
      options: opt
      data: this.toObject())
    })
  })

  ;['method'
  , 'static'
  ].forEach(function(key) {
    schema[key]('getChannel', function() {
      var pre = (prefix) ? shim(prefix) + sep : ''
        , post = (key === 'method') ? sep + this._id : ''
      
      return pre + shim(channel) + post
    })
  })

  ;['method'
  , 'static'
  ].forEach(function(key) {
    schema[key]('on', function(event, fn) {
      var self = this
      sub.on(event, function(chan, resp) {
        if (chan === this.getChannel()) {
          fn(chan, resp)
        }
      })
    })
  })

  ;['subscribe'
  , 'unsubscribe'
  ].forEach(function(method) {
    ;['method'
    , 'static'
    ].forEach(function(key) {
      schema[key](method, function(fn) {
        sub[method](this.getChannel(), fn)
      })
    })
  })
}
