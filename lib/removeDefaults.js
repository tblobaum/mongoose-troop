
/*!
 * Analytics Machine - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function mongooseRemoveDefaults (schema, options) {
  options = options || {}
  
  schema.method('removeDefaults', function () {
    if (options.debug) console.log('mongoose removeDefaults ', 
      this.constructor.modelName)
    var paths = schema.paths
    var defaults = {}
    for (var key in paths) {
      if (this._doc[key] === paths[key].defaultValue) {
        delete this._doc[key]
      }
    }
    return this
  })
    
}

module.exports = mongooseRemoveDefaults

