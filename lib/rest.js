
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// REST
// ----

var dataToObjects = require(__dirname +'/../helpers').dataToObjects

function rest (schema, options) {
  options = options || {}

  // Options
  var pagination = options.pagination || {}

  schema.static({
    get: get
  , post: update
  , put: update
  , del: del
  , search: search
  , bulk: search
  })

  if (!schema.statics.paginate) {
    schema.plugin(require(__dirname +'/pagination'), pagination)
  }
  
  function get (id, fn) {
    this.findById(id, function (err, doc) {
      fn(err, dataToObjects(doc))
    })
    return this
  }
  
  function update (data, fn) {
    var query = {}
    data._id && (query._id = data._id)
    delete data._id

    this.update(query, data, {
      upsert: true
    }, function (err, count) {
      if (err || !count) return fn(err, false)
      fn(null, true)
    })
    return this
  }
  
  function del (id, fn) {
    this.findById(id, function (err, doc) {
      if (err || !doc) return fn(err, false)
      doc.remove(function (err, doc) {
        if (err) return fn(err, false)
        fn(null, true)
      })
    })
    return this
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
    }, function (err, docs) {
      fn(err, dataToObjects(docs))
    })
    return this
  }
}

module.exports = rest
