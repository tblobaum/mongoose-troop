
/*!
 * Analyticker - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function mongooseFilter (schema, options) {
  options = options || {}
  
  schema.pre('save', function (next) {
    this.filter()
    next()
  })
  
  schema.method('filter', function () {
    if (options.debug) {
      console.log('mongoose filter ', 
        this.constructor.modelName)
    }
    var paths = schema.paths
    if (!'_id' in paths) paths['_id'] = ''
    for (var key in this._doc) {
      if (!(key in paths)) {
        delete this._doc[key]
        if (options.debug) {
          console.log('Warn: Cannot put '
          +key+' in '
          +this.constructor.modelName)
        }
      }
    }
    return this
  })
}

module.exports = mongooseFilter

