
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

function paginate (schema, options) {
  options || (options = {})

  var defaultLimit = options.defaultLimit || 10
    , defaultQuery = options.defaultQuery || {}
    , defaultPage = options.defaultPage || 1
    , defaultFields = options.defaultFields || []
    , currentPage = defaultPage
    , currentLimit = defaultLimit
    , currentQuery = defaultQuery
    , currentFields = defaultFields

  function cache (opt) {
    opt.query && (currentQuery = opt.query)
    opt.limit && (currentLimit = opt.limit)
    opt.page && (currentPage = opt.page)
  }

  schema.static('paginate', function (opt, fn) {
    if (!fn) {
      fn = opt
      opt = {}
    }
    var self = this
      , query = opt.query || currentQuery
      , page = opt.page || currentPage
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields

      cache(opt)
    this.find(query, fields, {
      skip: (limit * (page - 1))
    , limit: limit
    }, function(err, docs) {
      if (err) return (fn && fn(err))
      self.count(query, function (err, count) {
        if (err) return (fn && fn(err))
        fn && fn(err, docs, count, Math.ceil(count / limit), page)
      })
    })
  })

  schema.static('page', function (page, fn) {
    this.paginate({
      query: currentQuery
    , page: page
    , limit: currentLimit
    }, fn)
  })

  schema.static('nextPage', function (fn) {
    this.page(currentPage + 1, fn)
  })

  schema.static('prevPage', function (fn) {
    this.page(currentPage - 1, fn)
  })

  schema.static('firstPage', function (opt, fn) {
    if (!fn) {
      fn = opt
      opt = {}
    }
    var query = opt.query || currentQuery
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields
    
    this.paginate({
      query: query
    , page: 1
    , limit: limit
    , fields: fields
    }, fn)
  })

  schema.static('lastPage', function (opt, fn) {
    if (!fn) {
      fn = opt
      opt = {}
    }
    var self = this
      , query = opt.query || currentQuery
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields

    this.count(query, function (err, count) {
      if (err) return (fn && fn(err))
      self.paginate({
        query: query
      , page: Math.ceil(count / limit)
      , limit: limit
      , fields: fields
      }, fn)
    })
  })
}

module.exports = paginate
