
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , merge = require('../lib/merge')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Merge', function () {
  describe('#default()', function () {
    var BarSchema = new Schema()
    var FooSchema = new Schema({
      str: String
    , num: Number
    , bool: Boolean
    , str2: String
    , num2: Number
    , bool2: Boolean
    , ref: { type: ObjectId, ref: BarSchema }
    , und: String
    , nested: {
        one: String
      , two: Boolean
      }
    })
    FooSchema.plugin(merge)
    
    var FooModel = db.model('mergeFoo', FooSchema)
      , BarModel = db.model('mergeBar', BarSchema)
    
    var ref = new BarModel()

    var foo = new FooModel({
      str: 'hello'
    , num: 10
    , bool: true
    })

    var bar = new FooModel({
      str2: 'there'
    , num2: 200
    , bool2: false
    , und: undefined
    , nested: {
        one: 'one'
      , two: true
      }
    })

    var hello = new FooModel({
      ref: ref
    })

    it('should have custom methods', function (done) {
      assert.strictEqual(typeof FooSchema.methods.merge, 'function')
      done()
    })
    
    it('should merge the documents', function (done) {
      bar.merge(foo)
      assert.strictEqual(bar.str, 'hello')
      assert.strictEqual(Number(bar.num), 10)
      assert.strictEqual(bar.bool, true)
      done()
    })
    
    it('should merge the documents with nested paths', function (done) {
      foo.merge(bar)
      assert.strictEqual(foo.str2, 'there')
      assert.strictEqual(Number(foo.num2), 200)
      assert.strictEqual(foo.bool2, false)
      assert.strictEqual(foo.und, undefined)
      assert.strictEqual(foo.nested.one, 'one')
      assert.strictEqual(foo.nested.two, true)
      done()
    })

    it('should work with dbrefs', function (done) {
      bar.merge(hello)
      assert.strictEqual(bar.ref, ref._id)
      done()
    })
  })
})
