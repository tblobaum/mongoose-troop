
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , rest = require('../lib/rest')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('REST', function () {
  describe('#default()', function () {
    var FooSchema = new Schema({
      count: Number
    , title: String
    })
    FooSchema.plugin(rest)
    var FooModel = db.model('restFoo', FooSchema)
      , foo = new FooModel({
          count: 200
        , title: 'new'
        })
      , lastId
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should populate the db', function (done) {
      for (var x = 1; x <= 55; x++) {
        var instance = new FooModel({
          count: x 
        , title: 'foo' + x
        })
        instance.save(function(err, doc) {
          assert.strictEqual(err, null)
          lastId = doc._id
          if (doc.count == 55) done()
        })
      }
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.statics.get, 'function')
      assert.strictEqual(typeof FooSchema.statics.post, 'function')
      assert.strictEqual(typeof FooSchema.statics.put, 'function')
      assert.strictEqual(typeof FooSchema.statics.del, 'function')
      assert.strictEqual(typeof FooSchema.statics.search, 'function')
      assert.strictEqual(typeof FooSchema.statics.bulk, 'function')

      // Pagination properties
      assert.strictEqual(typeof FooSchema.statics.paginate, 'function')
      assert.strictEqual(typeof FooSchema.statics.firstPage, 'function')
      assert.strictEqual(typeof FooSchema.statics.lastPage, 'function')
      done()
    })

    it('should post', function (done) {
      var data = {
        count: 100
      , title: 'something'
      }
      FooModel.post(data, function (err, ok) {
        assert.strictEqual(err, null)
        assert.ok(ok)
        done()
      })
    })

    it('should get', function (done) {
      FooModel.get(lastId, function (err, doc) {
        assert.strictEqual(err, null)
        done()
      })
    })

    it('should put', function (done) {
      foo.save(function (err, doc) {
        assert.strictEqual(err, null)
        assert.equal(doc.title, 'new')
        doc.title = 'put'
        delete doc.count

        FooModel.put(doc.toObject(), function (err, ok) {
          assert.strictEqual(err, null)
          assert.ok(ok)
        })
      })
      done()
    })

    it('should del', function (done) {
      FooModel.del(foo.toObject(), function (err, ok) {
        assert.strictEqual(err, null)
        assert.ok(ok)
        done()
      })
    })

    it('should search', function (done) {
      FooModel.search({
        query: {}
      , limit: 10
      , page: 2
      }, function (err, docs) {
        assert.strictEqual(err, null)
        assert.strictEqual(docs.length, 10)
        done()
      })
    })

    it('should search', function (done) {
      FooModel.search({
        query: {title: 'put'}
      , limit: 10
      , page: 2
      }, function (err, docs) {
        assert.strictEqual(err, null)
        done()
      })
    })
  })
})
