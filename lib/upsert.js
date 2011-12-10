
/*!
 * Analytics Machine - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

var Mongoose = require('mongoose')

function mongooseUpsert (schema, options) {
  options = options || {}
  
  schema.method('upsert', function (conditions, update, callback) {
    var Model = this.constructor
      , oid = Mongoose.Types.ObjectId
      , defaultConditions = JSON.stringify({_id: this._doc._id })
      , opts = options.options || {upsert: true}
    
    if (options.debug) console.log('mongoose upsert ', this.constructor.modelName)
    
    this.removeDefaults()
    this.publish()
    var newDoc = this.toObject()
    delete newDoc._id
    
    if (options.debug) console.log('attempting to upsert a new document: ' + this.isNew, newDoc)
    if (typeof conditions === 'undefined') { 
      if (options.debug) console.log('no conditions or update or callback, use the id to insert newDoc and use a noop callback')
      Model.update(defaultConditions, {$set: newDoc}, opts, function (e) {
        console.log(58, e)
      });
    } else if (typeof conditions === 'function') { 
      if (options.debug) console.log('no conditions or update but have a callback, use id to insert newDoc and use callback')
      Model.update(defaultConditions, {$set: newDoc}, opts, conditions);
    } else if (typeof update === 'function') {
      if (options.debug) console.log('have first argument and a callback')
      if (typeof conditions === 'string') { 
        if (options.debug) console.log('have an id as first argument, use the id to insert newDoc and use callback')
        Model.update(defaultConditions, {$set: newDoc}, opts, update)
      } else if (/\$/.test(Object.keys(conditions).toString())) {
        if (options.debug) console.log('have the upsert update query as first argument')
        //console.log(defaultConditions, conditions, opts, update)
        Model.update(defaultConditions, conditions, opts, update)
      } else { 
        if (options.debug) console.log('have the conditions as first argument')
        Model.update(conditions, {$set: newDoc}, opts, update)
      }
    } else if (typeof callback === 'function') { 
      if (options.debug) console.log('have conditions, update, and a callback, use conditions to update update and use callback')
      Model.update(conditions, update, opts, callback)
    } else {
      if (typeof conditions === 'string') { 
        if (options.debug) console.log('have an id as first argument and no callback, use the id to insert newDoc and use a noop callback')
        Model.update(oid.fromString(conditions), {$set: newDoc}, opts, function (e) {
          console.log(82, e)
        })
      } else {
        throw new Error('Invalid parameters for upsert method.')
      }  
    }
    return this
  })

}

module.exports = mongooseUpsert

