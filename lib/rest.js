
/*!
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

var mongoose = require('mongoose')

function shim(data) {
  if (!data) return null
  if (data instanceof Array) {
    return data.map(function(doc) { 
      return doc.toObject()
    })
  }
  return data.toObject()
}

function rest (schema, options) {
  options = options || {}

  var pagination = options.pagination || {}

  schema.static({
    get: get
  , post: update
  , put: update
  , del: del
  , search: search
  , bulk: search
  , controller: controller
  })

  if (!schema.statics.paginate) {
    schema.plugin(require('./pagination'), pagination)
  }
  
  function get (id, fn) {
    this.findById(id, function (err, doc) {
      fn(err, shim(doc))
    })
  }
  
  function update (data, fn) {
    var query = {}
    if (data._id) {
      query._id = data._id
      delete data._id
    }
    this.update(query, data, {
      upsert: true
    }, function (err, doc, blah, wtf) {
      if (err || !doc) return fn(err, false)
      fn(null, true)
    })
  }
  
  function del (id, fn) {
    this.findById(id, function (err, doc) {
      if (err || !doc) return fn(err, false)
      doc.remove(function (err, doc) {
        if (err) return fn(err, false)
        fn(null, true)
      })
    })
  }
  
  function search (query, fn) {
    var query = query || {}
      , limit = query.limit
      , page = query.page

    delete query.limit
    delete query.page

    this.paginate({
      query: query
    , limit: limit
    , page: page
    }, function (err, docs, total, pages, current) {
      fn(err, shim(docs))
    })
  }

  function controller () {
    ;['get'
    , 'post'
    , 'put'
    , 'del'
    , 'search'
    , 'bulk'
    ].forEach(function(method) {
      this[method] = schema.statics[method]
    })
  }
}

module.exports = rest
