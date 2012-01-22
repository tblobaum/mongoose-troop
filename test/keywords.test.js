
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , keywords = require('../lib/keywords')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Keywords', function () {
  describe('#default()', function () {
    var FooSchema = new Schema()
    FooSchema.plugin(keywords, {
      source: 'title'
    })
    var FooModel = db.model('keywordFoo', FooSchema)
      , foo = new FooModel({ title: 'i like cookies!'})
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.title, 'object')
      assert.strictEqual(typeof FooSchema.paths.keywords, 'object')
      assert.strictEqual(typeof FooSchema.methods.extractKeywords, 'function')
      assert.strictEqual(typeof FooSchema.statics.extractKeywords, 'function')
      done()
    })

    it('should extract keywords on save', function (done) {
      foo.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(doc.keywords.toString(), ['like', 'cookies'].toString())
        done()
      })
    })

    it('should manually extract keywords', function (done) {
      var str = 'one two three'
      assert.strictEqual(foo.extractKeywords(str).toString(), ['one', 'two', 'three'].toString())
      assert.strictEqual(FooModel.extractKeywords(str).toString(), ['one', 'two', 'three'].toString())
      done()
    })
  })

  describe('#custom()', function () {
    var FooSchema = new Schema()
    FooSchema.plugin(keywords, {
      source: ['moo', 'cow']
    , target: 'milk'
    , minLength: 3
    , invalidChar: 'i'
    , override: true
    , naturalize: true
    })
    var BarModel = db.model('keywordBar', FooSchema)
      , bar = new BarModel({ 
          moo: 'fooed bars test one'
        , cow: 'test õne twø lorem'
        })
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.moo, 'object')
      assert.strictEqual(typeof FooSchema.paths.cow, 'object')
      assert.strictEqual(typeof FooSchema.paths.milk, 'object')
      assert.strictEqual(typeof FooSchema.methods.extractKeywords, 'function')
      done()
    })

    it('should extract keywords on save', function (done) {
      bar.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(doc.milk.toString(), [
          'foo', 'bar', 'test', 'on', 'two', 'lorem'
        ].toString())
        done()
      })
    })

    it('should manually extract keywords', function (done) {
      var str = 'a two three'
      assert.strictEqual(bar.extractKeywords(str).toString(), ['two', 'three'].toString())
      done()
    })

    it('should manually extract keywords from model', function (done) {
      var words = BarModel.extractKeywords('a two three')
      assert.strictEqual(words.toString(), ['two', 'three'].toString())
      assert.strictEqual(words.toString(), bar.extractKeywords('a two three').toString())
      done()
    })
  })
})
