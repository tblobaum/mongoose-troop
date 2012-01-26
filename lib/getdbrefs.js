
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Get DBRefs
// ----------

// Plugin
function getdbrefs (schema, options) {
  options = options || {}
  
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

module.exports = getdbrefs
