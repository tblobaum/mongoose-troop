
/*!
 * Copyright(c) Beau Sorensen
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
    var pre = (prefix) ? shim(prefix) + sep : ''
    pub.publish(pre + shim(channel), JSON.stringify({
      options: opt
      data: this.toObject())
    })
  })

  ;['subscribe'
  , 'unsubscribe'
  ].forEach(function(method) {
    ;['method'
    , 'static'
    ].forEach(function(key) {
      schema[key](method, function() {
        var pre = (prefix) ? shim(prefix) + sep : ''
          , post = (key === 'method') ? sep + this._id : ''
          , chan = pre + shim(channel) + post
        
        sub[method](chan)
      })
    })
  })
}
