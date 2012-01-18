
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , paginate = require('../lib/paginate')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Paginate', function () {
  var FooSchema = new Schema({ count: Number })
  
  describe('#default()', function () {
    FooSchema.plugin(paginate)
    var FooModel = mongoose.model('slugFoo', FooSchema)
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should populate the db', function (done) {
      for (var x = 1; x <= 55; x++) {
        var instance = new FooModel({ count: x })
        instance.save(function(err, doc) {
          assert.strictEqual(err, null)
          if (doc.count == 55) done()
        })
      }
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.statics.paginate, 'function')
      assert.strictEqual(typeof FooSchema.statics.page, 'function')
      assert.strictEqual(typeof FooSchema.statics.nextPage, 'function')
      assert.strictEqual(typeof FooSchema.statics.prevPage, 'function')
      assert.strictEqual(typeof FooSchema.statics.firstPage, 'function')
      assert.strictEqual(typeof FooSchema.statics.lastPage, 'function')
      done()
    })

    it('should paginate', function (done) {
      FooModel.paginate({
        page: 1
      , limit: 10
      }, function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 6)
        assert.strictEqual(current, 1)
        assert.strictEqual(docs.length, 10)
        done()
      })
    })

    it('should paginate', function (done) {
      FooModel.paginate({
        page: 1
      , limit: 25
      }, function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 1)
        assert.strictEqual(docs.length, 25)
        done()
      })
    })

    it('should go to page 2', function (done) {
      FooModel.nextPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 2)
        assert.strictEqual(docs.length, 25)
        done()
      })
    })

    it('should go to page 3', function (done) {
      FooModel.nextPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 3)
        assert.strictEqual(docs.length, 5)
        done()
      })
    })

    it('should go back to page 2', function (done) {
      FooModel.prevPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 2)
        assert.strictEqual(docs.length, 25)
        done()
      })
    })

    it('should go the last page', function (done) {
      FooModel.lastPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 3)
        assert.strictEqual(docs.length, 5)
        done()
      })
    })

    it('should go the first page', function (done) {
      FooModel.firstPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 1)
        assert.strictEqual(docs.length, 25)
        done()
      })
    })
  })
})
