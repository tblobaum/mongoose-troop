
// Dependencies
var assert = require('assert')
  , mongoose = require('mongoose')
  , acl = require('../lib/acl')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('ACL', function () {
  describe('#default()', function () {
    var FooSchema = new Schema({})
    FooSchema.plugin(acl)
    var FooModel = db.model('foo', FooSchema)
    var foo = new FooModel()

    foo.addAccess('blog')
    foo.addAccess('dashboard')

    it('should have access to blog', function (done) {
      foo.access('blog', function (bool) {
        assert.strictEqual(bool, true)
        done()
      })
    })
    
    it('should have access to dashboard', function (done) {
      foo.access('dashboard', function (bool) {
        assert.strictEqual(bool, true)
        done()
      })
    })
      
    it('should no longer have access to dashboard', function (done) {
      foo.removeAccess('dashboard')
      foo.access('dashboard', function (bool) {
        assert.strictEqual(bool, false)
        done()
      })
    })
  })
})
