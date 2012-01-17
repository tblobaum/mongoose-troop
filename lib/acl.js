
/*!
 * Copyright(c) Tom Blobaum
 * MIT Licensed
 */

function acl (schema, options) {
  options = options || {}

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
      this.acl.push(key)
      this.markModified('acl')
    }
  })
  
  schema.method('removeAccess', function (key) {
    if (this.access(key)) {
      this.acl.splice(this.acl.indexOf(key), 1) 
      this.markModified('acl')
    }
  })

  schema.method('access', function (key, next) {
    var bool = !!~this.acl.indexOf(key)
    next && next(bool)
    return bool
  })
}

module.exports = acl
