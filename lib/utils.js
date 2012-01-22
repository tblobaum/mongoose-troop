
/*!
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function utils (schema, options) {
  options = options || {}
  
  schema.method('removeDefaults', function () {
    schema.eachPath(function (name, path) {
      if (this._doc[name] == path.defaultValue) {
        delete this._doc[name]
      }
    })
    return this
  })

  schema.method('merge', function (doc) {
    var self = this
    schema.eachPath(function (name) {
      if (name != '_id' && typeof doc[name] !== 'undefined') {
        self.set(name, doc[name])
      }
    })
    return this
  })

  schema.method('getdbrefs', function (fn) {
    var refs = {}
      , self = this
    
    schema.eachPath(function (name, path) {
      var caster = path.caster
        , opt = path.options
      
      if (caster && caster.options && caster.options.ref) {
        refs[caster.options.ref] = self[name]
      } else if (opt && opt.ref) {
        refs[opt.ref] = self[name]
      }
    })
    fn && fn(refs)
    return refs
  })
}

module.exports = utils
