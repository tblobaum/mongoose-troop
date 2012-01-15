
function dbrefs (schema, options) {
  options = options || {}
  
  schema.method('getdbrefs', function (callback) {
    var refs = {}
      , self = this
    schema.eachPath(function(path) {
      var caster = schema.paths[path].caster
      var opt = schema.paths[path].options
      if (caster && caster.options && caster.options.ref) {
        refs[caster.options.ref] = self[caster.options.ref]
      }
      else if (opt && opt.ref) {
        refs[opt.ref] = self[opt.ref]
      }
    })
    callback(refs)
    return this
  })
}

module.exports = dbrefs

