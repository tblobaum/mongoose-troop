
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , keywords = require('../lib/keywords')
  , common = require('./common')
  , db = common.db
  , cleanup = common.cleanup
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Keywords', function() {
  describe('#default()', function() {
    var FooSchema = new Schema()
    FooSchema.plugin(keywords, {
      source: 'title'
    })
    var FooModel = mongoose.model('keywordFoo', FooSchema)
      , foo = new FooModel({ title: 'i like cookies!'})
    
    before(function() {
      FooModel.remove(function(err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function(done) {
      assert.strictEqual(typeof FooSchema.paths.title, 'object')
      assert.strictEqual(typeof FooSchema.paths.keywords, 'object')
      assert.strictEqual(typeof FooSchema.methods.extractKeywords, 'function')
      done()
    })

    it('should extract keywords on save', function(done) {
      foo.save(function(err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(doc.keywords.toString(), ['like', 'cooki'].toString())
        done()
      })
    })

    it('should manually extract keywords', function(done) {
      var words = foo.extractKeywords('one two three')
      assert.strictEqual(words.toString(), ['on', 'two', 'three'].toString())
      done()
    })
  })

  describe('#custom()', function() {
    var FooSchema = new Schema()
    FooSchema.plugin(keywords, {
      source: ['moo', 'cow']
    , target: 'milk'
    , minLength: 3
    , invalidChar: 'i'
    , override: true
    })
    var BarModel = mongoose.model('keywordBar', FooSchema)
      , bar = new BarModel({ 
          moo: 'fooed bars'
        , cow: 'test õne twø lorem'
        })
    
    before(function() {
      BarModel.remove(function(err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function(done) {
      assert.strictEqual(typeof FooSchema.paths.moo, 'object')
      assert.strictEqual(typeof FooSchema.paths.cow, 'object')
      assert.strictEqual(typeof FooSchema.paths.milk, 'object')
      assert.strictEqual(typeof FooSchema.methods.extractKeywords, 'function')
      done()
    })

    it('should extract keywords on save', function(done) {
      bar.save(function(err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(doc.milk.toString(), [
          'foo','bar','test','on','two','lorem'
        ].toString())
        done()
      })
    })

    it('should manually extract keywords', function(done) {
      var words = bar.extractKeywords('a two three')
      assert.strictEqual(words.toString(), ['two', 'three'].toString())
      done()
    })
    
    
    
  })

  // cleanup()
})
