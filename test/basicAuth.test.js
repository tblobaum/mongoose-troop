
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , basicAuth = require('../lib/basicAuth')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('BasicAuth', function () {
  describe('#default()', function () {
    var FooSchema = new Schema()
    FooSchema.plugin(basicAuth)
    var FooModel = db.model('authFoo', FooSchema)
    var foo = new FooModel({ 
      username: 'sorensen'
    , password: 'beau'
    })

    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.username, 'object')
      assert.strictEqual(typeof FooSchema.paths.hash, 'object')
      assert.strictEqual(typeof FooSchema.virtuals.password, 'object')
      assert.strictEqual(typeof FooSchema.methods.authenticate, 'function')
      assert.strictEqual(typeof FooSchema.methods.setPassword, 'function')
      assert.strictEqual(typeof FooSchema.statics.authenticate, 'function')
      assert.strictEqual(typeof FooSchema.statics.register, 'function')
      done()
    })

    it('should create hash on save', function (done) {
      foo.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.hash, 'string')
        done()
      })
    })

    it('should authenticate', function (done) {
      foo.authenticate('beau', function (err, result) {
        assert.strictEqual(err, undefined)
        assert.ok(result)
        done()
      })
    })

    it('should set new password', function (done) {
      foo.setPassword('mouse', function (err) {
        assert.strictEqual(err, null)
        done()
      })
    })

    it('should re-authenticate', function (done) {
      foo.authenticate('mouse', function (err, result) {
        assert.strictEqual(err, undefined)
        assert.ok(result)
        done()
      })
    })

    it('should not authenticate', function (done) {
      foo.authenticate('computer', function (err, result) {
        assert.strictEqual(err, undefined)
        assert.strictEqual(result, false)
        done()
      })
    })

    it('should register a new user from model', function (done) {
      FooModel.register({
        username: 'roger'
      , password: 'rabbit'
      }, function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(doc.username, 'roger')
        assert.strictEqual(typeof doc.hash, 'string')
        done()
      })
    })

    it('should authenticate from model', function (done) {
      FooModel.authenticate('roger', 'rabbit', function (err, result) {
        assert.strictEqual(err, null)
        assert.ok(result)
        done()
      })
    })
  })

  describe('#custom()', function () {
    var FooSchema = new Schema()
    FooSchema.plugin(basicAuth, {
      loginPath: 'login'
    , hashPath: 'key'
    , workFactor: 1
    })
    var BarModel = db.model('authBar', FooSchema)
    var bar = new BarModel({ 
      login: 'foo'
    , password: 'bar'
    })
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.paths.login, 'object')
      assert.strictEqual(typeof FooSchema.paths.key, 'object')
      assert.strictEqual(typeof FooSchema.virtuals.password, 'object')
      assert.strictEqual(typeof FooSchema.methods.authenticate, 'function')
      assert.strictEqual(typeof FooSchema.methods.setPassword, 'function')
      assert.strictEqual(typeof FooSchema.statics.authenticate, 'function')
      assert.strictEqual(typeof FooSchema.statics.register, 'function')
      done()
    })

    it('should create hash on save', function (done) {
      bar.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof doc.key, 'string')
        done()
      })
    })

    it('should authenticate', function (done) {
      bar.authenticate('bar', function (err, result) {
        assert.strictEqual(err, undefined)
        assert.ok(result)
        done()
      })
    })

    it('should not authenticate', function (done) {
      bar.authenticate('computer', function (err, result) {
        assert.strictEqual(err, undefined)
        assert.strictEqual(result, false)
        done()
      })
    })
  })
})
