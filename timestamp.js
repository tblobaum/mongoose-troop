
/*!
 * Analytics Machine - Models - Mongoose Plugins
 *
 * Authors: Thomas Blobaum, Félix Bellanger
 *
 * MIT Licensed
 */

function mongooseTimestamp (schema, options) {
  options = options || {}
  
  schema.pre('save', function (next) {
    this.filter()
    next()
  })
  
  schema.method('filter', function () {
  
    return this
  })
  
}

module.exports = mongooseTimestamp


function timestampable(options) {
  options = options || {}
  var createdAt  = options.createdAt || 'createdAt'
    , modifiedAt = options.modifiedAt || 'modifiedAt'
    
  return function timestampable(schema) {
    // create the timestamp keys
    var obj = {}
    obj[createdAt]  = { type: Date }
    obj[modifiedAt] = { type: Date }
    schema.add(obj)
    
    // set/update timestamps before save
    schema.pre('save', function(next) {
    
      if (this.isNew && createdAt) {
        this[createdAt] = Date.now()
      }
      
      if (modifiedAt) {
        this[modifiedAt] = Date.now()
      }
      
      next()
    })
  }
}
