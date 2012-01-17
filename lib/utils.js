
/*!
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function trooputils (schema, options) {
  options = options || {}
  
  schema.method('removeDefaults', function () {
    if (options.debug) console.log('mongoose removeDefaults ', 
      this.constructor.modelName)
    
    var paths = schema.paths
      , defaults = {}
    
    for (var key in paths) {
      if (this._doc[key] === paths[key].defaultValue) {
        delete this._doc[key]
      }
    }
    return this
  })

  schema.method('merge', function (doc) {
    var self = this
    self.schema.eachPath(function(path) {
      if (path != '_id' && (typeof doc[path] != "undefined")) {
        self.set(path, doc[path])
      }
    })
    return this
  })

  schema.method('getdbrefs', function (fn) {
    var refs = {}
      , self = this
    
    schema.eachPath(function(path) {
      var caster = schema.paths[path].caster
        , opt = schema.paths[path].options
      
      if (caster && caster.options && caster.options.ref) {
        refs[caster.options.ref] = self[path]
      } else if (opt && opt.ref) {
        refs[opt.ref] = self[path]
      }
    })
    fn && fn(refs)
    return refs
  })
}

module.exports = trooputils

