
//  (c) 2012 Tom Blobaum
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// acl
// ---

// Plugin
function acl (schema, options) {
  options = options || {}

  // Options
  var aclPath = options.aclPath || 'acl'
    , fields = {}

  if (!schema.paths[aclPath]) {
    fields[aclPath] = {
      type: [String]
    , default: ['public']
    }
  }
  schema.add(fields)

  schema.method('addAccess', function (key) {
    if (!this.access(key)) {
      this[aclPath].push(key)
      this.markModified(aclPath)
    }
    return this
  })

  schema.method('removeAccess', function (key) {
    if (this.access(key)) {
      this[aclPath].splice(this[aclPath].indexOf(key), 1)
      this.markModified(aclPath)
    }
    return this
  })

  schema.method('access', function (key, next) {
    var bool = !!~this[aclPath].indexOf(key)
    next && next(bool)
    return bool
  })
}

module.exports = acl
