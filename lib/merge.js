
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Merge
// -----

var nestedPath = require('../helpers').nestedPath

// Plugin
function merge (schema, options) {
  options = options || {}
  
  schema.method('merge', function (doc) {
    var self = this
    schema.eachPath(function (name) {
      var val = nestedPath(doc, name)
      // Merge all set fields, except for the ObjectID
      if (name !== '_id' && val !== undefined) {
        nestedPath(self, name, val)
      }
    })
    return this
  })
}

module.exports = merge
