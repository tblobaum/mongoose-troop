
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , slugify = require('../lib/slugify')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Slugify', function () {
  var FooSchema = new Schema()
  
  describe('#default()', function () {
    FooSchema.plugin(slugify)
    var FooModel = db.model('slugFoo', FooSchema)
      , foo = new FooModel({ title: 'i like cookies!'})
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.title, 'object')
      assert.strictEqual(typeof FooSchema.paths.slug, 'object')
      assert.strictEqual(typeof FooSchema.methods.slugify, 'function')
      assert.strictEqual(typeof FooSchema.statics.slugify, 'function')
      done()
    })

    it('should slugify on save', function (done) {
      foo.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.slug, 'string')
        assert.strictEqual(doc.slug, 'i-like-cookies')
        done()
      })
    })

    it('should have the same value', function (done) {
      foo.title = 'oh hai thar'
      foo.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.slug, 'string')
        assert.strictEqual(doc.slug, 'i-like-cookies')
        done()
      })
    })

    it('should manually slugify', function (done) {
      var str = 'one two three'
      assert.strictEqual(foo.slugify(str), 'one-two-three')
      assert.strictEqual(FooModel.slugify(str), 'one-two-three')
      done()
    })
  })

  describe('#custom()', function () {
    FooSchema.plugin(slugify, {
      source: 'hey'
    , target: 'there'
    , maxLength: 20
    , invalidChar: 'i'
    , spaceChar: '_'
    , override: true
    })
    var BarModel = db.model('slugBar', FooSchema)
      , bar = new BarModel({ 
          hey: 'lorem ipsum! twø a foo'
        })
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.hey, 'object')
      assert.strictEqual(typeof FooSchema.paths.there, 'object')
      assert.strictEqual(typeof FooSchema.methods.slugify, 'function')
      done()
    })

    it('should slugify on save', function (done) {
      bar.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.there, 'string')
        assert.strictEqual(doc.there, 'lorem_ipsumi_two_a_f')
        done()
      })
    })

    it('should create a new slug', function (done) {
      bar.hey = 'well hëy there guy!!!'
      bar.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.there, 'string')
        assert.strictEqual(doc.there, 'well_hey_there_guyi')
        done()
      })
    })

    it('should manually slugify', function (done) {
      var str = 'one two three'
      assert.strictEqual(bar.slugify(str), 'one_two_three')
      assert.strictEqual(BarModel.slugify(str), 'one_two_three')
      done()
    })
  })
})
