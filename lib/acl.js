
/*!
 * Copyright(c) Tom Blobaum
 * MIT Licensed
 */

function acl (schema, options) {
  options = options || {}
  schema.add({ acl: { type:[String], default: ['public'] } })
  
  schema.method('add_access', function (key) {
    if (!access.call(this, key)) {
      this.acl.push(key)
      this.markModified('acl')
    }
  })
  
  schema.method('remove_access', function (key) {
    if (access.call(this, key)) {
      this.acl.splice(this.acl.indexOf(key), 1) 
      this.markModified('acl')
    }
  })
  
  schema.method('access', access)
    
  function access (key, next) {
    var bool = this.acl.indexOf(key) >= 0
    next && next(bool)
    return bool
  }
  
}

module.exports = acl

