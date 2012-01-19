
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

  schema.static('get', get)
  schema.static('post', update)
  schema.static('put', update)
  schema.static('del', del)
  schema.static('search', search)
  schema.static('bulk', search)
  schema.static('controller', controller)

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
  
  function search (query, fn) {
    var query = query || {}
      , limit = query.limit || 10
      , page = query.page || 1

    delete query.limit
    delete query.page

    this.find(query, [], { 
      skip: (limit * (page - 1))
    , limit: limit 
    }, function (err, docs) {
      fn(err, shim(docs))
    })
  }
  
  function get (id, fn) {
    this.findById(id, function (err, doc) {
      fn(err, shim(doc))
    })
  }
  
  function update (doc, fn) {
    if (doc._id) {
      this.findById(doc._id, function (err, doc) {
        if (err || !doc) return fn(err, false)
        doc.merge(doc)
        doc.save(function (err, doc) {
          if (err) return fn(err, false)
          fn(null, true)
        })
      })
    } else {
      new this(doc).save(function (err) {
        if (err) return fn(err, false)
        fn(null, true)
      })
    }
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
}

module.exports = rest
