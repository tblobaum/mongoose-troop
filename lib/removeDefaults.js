
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Remove Defaults
// ---------------

// Plugin
function removeDefaults (schema, options) {
  options = options || {}
  
  schema.method('removeDefaults', function () {
    var self = this
    schema.eachPath(function (name, path) {
      var current = self._doc[name]
        , defaults = path.defaultValue

      // Check for numbers, as the schema will hold them as 
      // objects with path related properties
      if (toString.call(current) === '[object Number]') {
        current =  Number(current)
        defaults = Number(defaults)
      }

      // Remove property if it matches the default
      if (current === defaults) {
        delete self._doc[name]
      }
    })
    return this
  })
}

module.exports = removeDefaults
