
/*!
 * Analytics Machine - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function mongooseMerge (schema, options) {
  options = options || {}

  schema.method('merge', function (doc) {
    var self = this
    self.schema.eachPath(function(path) {
      if (path != '_id' && (typeof doc[path] != "undefined")) {
        self.set(path, doc[path])
      }
    })
    
    if (options.debug) {
      console.log('mongoose merge ', this.constructor.modelName)
    }
    return this
  })
}

module.exports = mongooseMerge

