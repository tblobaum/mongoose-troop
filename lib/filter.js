
/*!
 * Analytics Machine - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function mongooseFilter (schema, options) {
  options = options || {}
  
  // Register a save hook, this will be executed before saving the document.
  schema.pre('save', function (next) {
    if (options.debug) {
      console.log('pre save hook got called. About to call the filter method') 
    }
    this.filter()
    next()
  })

  
  /*
   * Remove properties from the model that are not in schema.
   */
  schema.method('filter', function () {
    if (options.debug) {
      console.log('mongoose filter ', 
        this.constructor.modelName)
    }
    // paths will contain the attribute defined in the Schema
    var paths = schema.paths
    if (!'_id' in paths) paths['_id'] = ''

    // this._doc contains the document. This may contain some unwanted attribute which are not declared in the schema
    // Loop all the attribute comes from doc to that of schema defined path. If it is not there remove from the _doc.
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

