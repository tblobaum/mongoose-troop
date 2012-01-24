
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , removeDefaults = require('../lib/removeDefaults')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Remove Defaults', function () {
  describe('#default()', function () {
    var FooSchema = new Schema({
      title: { type: String, default: 'hello' }
    , count: { type: Number, default: 5 }
    , bool: { type: Boolean, default: false }
    , another: { type: Boolean, default: true }
    // , nested: {
    //     str: { type: String, default: 'nested' }
    //   , bool: { type: Boolean, default: true }
    //   , num: { type: Number, default: 2 }
    //   }
    })

    FooSchema.plugin(removeDefaults)
    var FooModel = db.model('removeDefaultsFoo', FooSchema)
    var foo = new FooModel()
    
    var foo2 = new FooModel({
      title: 'title'
    , count: 2
    , bool: true
    , another: false
    // , nested: {
    //     str: 'what'
    //   , bool: false
    //   , num: 10
    //   }
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.methods.removeDefaults, 'function')
      done()
    })
    
    it('should remove the defaults', function (done) {
      var removed = foo.removeDefaults()
      assert.strictEqual(removed.title, undefined)
      assert.strictEqual(removed.count, undefined)
      assert.strictEqual(removed.bool, undefined)
      assert.strictEqual(removed.another, undefined)
      done()
    })
    
    // it('should remove the nested path defaults', function (done) {
    //   var removed = foo.removeDefaults()
    //   assert.strictEqual(removed.nested.str, undefined)
    //   assert.strictEqual(removed.nested.bool, undefined)
    //   assert.strictEqual(removed.nested.num, undefined)
    //   done()
    // })
    
    it('should not remove the defaults', function (done) {
      var removed = foo2.removeDefaults()
      assert.strictEqual(removed.title, 'title')
      assert.strictEqual(Number(removed.count), 2)
      assert.strictEqual(removed.bool, true)
      assert.strictEqual(removed.another, false)
      done()
    })
    
    // it('should not remove the nested path defaults', function (done) {
    //   var removed = foo2.removeDefaults()
    //   console.log('foo: ', foo2)
    //   console.log('removed: ', removed)
    //   assert.strictEqual(removed.nested.str, 'what')
    //   assert.strictEqual(removed.nested.bool, false)
    //   assert.strictEqual(Number(removed.nested.num), 10)
    //   done()
    // })
  })
})
