
/*!
 * Analytics Machine - Mongoose Rest
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

var _ = require('underscore')
  , Mongoose = require('mongoose')

function mongooseRest (schema, options) {
  options = options || {};
  
  schema.static('put', _update)
  
  schema.static('post', _update)
  
  schema.static('get', function (id, callback) {
    var Model = Mongoose.model(schema.virtuals.modelName.getters[0](), schema)
    Model.find({_id:id}, function (e, documents) {
      if (e) {
        if (options.debug) console.log('get', e)
        callback(e, false)
        return
      }
      if (!documents) {
        callback(false, false)
        return
      }
      callback(false, JSON.parse(JSON.stringify(documents)))
      return
    })
  })
  
  schema.static('del', function (id, callback) {
    var modelName = schema.virtuals.modelName.getters[0]()
      , Model = Mongoose.model(modelName, schema)
    Model
      .findById(id)
      .populate('_owner')
      .run(function (err, document) {
        if (!document) {
          callback(false, false)
          return
        } else {
        
          var list = document._owner[modelName]
          list = _.reject(list, function (val) {
            if (_.isEqual(String(val), String(id))) return true
          })
          document._owner.save()
          document.remove()
          callback(false, true)
        }
      })
  })
  
  
  schema.static('search', function (query, callback) {
    var Model = Mongoose.model(schema.virtuals.modelName.getters[0](), schema)
      , query = query || {}
      , limit = query.limit || 10
      , page = query.page || 1
    delete query.limit
    delete query.page
    Model.find(query, [], { skip: (limit * (page-1)), limit: limit }, function (e, documents) {
      if (e) {
        if (options.debug) console.log('search', e)
        callback(e, false)
        return
      }
      if (!documents) {
        callback(false, false)
        return
      } else {
        callback(false, JSON.parse(JSON.stringify(documents)))
        return
      }
    })
  })
  
  schema.static('bulk', function (query, callback) {
  
  })
  
  schema.static('controller', function () {
    var modelName = schema.virtuals.modelName.getters[0]()
      , Model = Mongoose.model(modelName, schema)
    this.get = Model.get
    this.put = Model.put
    this.post = Model.post
    this.del = Model.del
    this.delAll = Model.delAll
    this.search = Model.search
  })
    
  function _update (doc, callback) {
    var modelName = schema.virtuals.modelName.getters[0]()
      , Model = Mongoose.model(modelName, schema)
    Model.findById(doc._id, function (e, document) {
      if (e) {
        if (options.debug) console.log('put', e)
        callback(e, false)
        return
      }
      
      if (!document) {
        if (doc.domain) doc.href = doc.domain // move to model schema
        var model = new Model(doc)
        model.save(function (e) {
          if (e) {
            if (options.debug) console.log('post', e)
            callback(e, false)
            return
          }
          callback(false, true)
        })
      }
      
      else {
        document.merge(doc)
        document.save()
        callback(false, true)
      }
      
    })  
  }
  
}

module.exports = mongooseRest

