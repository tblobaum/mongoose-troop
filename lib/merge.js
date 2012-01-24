
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Merge
// -----

// Plugin
function merge (schema, options) {
  options = options || {}
  
  schema.method('merge', function (doc) {
    var self = this
    schema.eachPath(function (name) {
      // Merge all set fields, except for the ObjectID
      if (name != '_id' && typeof doc[name] !== 'undefined') {
        self.set(name, doc[name])
      }
    })
    return this
  })
}

module.exports = merge
