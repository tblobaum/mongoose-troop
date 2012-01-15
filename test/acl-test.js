
// Dependencies
var assert = require('assert')
  , mongoose = require('mongoose')
  , acl = require('../lib/acl')
  , common = require('./common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('acl', function() {
  describe('#default()', function() {
    var FooSchema = new Schema({})
    FooSchema.plugin(acl)
    var FooModel = mongoose.model('foo', FooSchema)
    var foo = new FooModel()

    foo.add_access('blog')
    foo.add_access('dashboard')

    it('should have access to blog', function(done) {
      foo.access('blog', function (bool) {
        assert.strictEqual(bool, true)
        done()
      })
    })
    
    it('should have access to dashboard', function(done) {
      foo.access('dashboard', function (bool) {
        assert.strictEqual(bool, true)
        done()
      })
    })
      
    it('should no longer have access to dashboard', function(done) {
      foo.remove_access('dashboard')
      foo.access('dashboard', function (bool) {
        assert.strictEqual(bool, false)
        done()
      })
    })
        
  })

})
