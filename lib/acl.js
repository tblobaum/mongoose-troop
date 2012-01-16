
/*!
 * Copyright(c) Tom Blobaum
 * MIT Licensed
 */

function acl (schema, options) {
  options = options || {}
  schema.add({ acl: { type:[String], default: ['public'] } })
  
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

  schema.method('access', function(key, next) {
    var bool = !!~this.acl.indexOf(key)
    next && next(bool)
    return bool
  })  
  
}

module.exports = acl

