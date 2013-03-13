
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , pagination = require('../lib/pagination')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Pagination', function () {
  describe('#default()', function () {
    var FooSchema = new Schema({ count: Number })
    FooSchema.plugin(pagination)
    var FooModel = db.model('paginateFoo', FooSchema)
    
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

    it('should go the last page', function (done) {
      FooModel.lastPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 6)
        assert.strictEqual(current, 6)
        assert.strictEqual(docs.length, 5)
        done()
      })
    })

    it('should go the first page', function (done) {
      FooModel.firstPage(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 55)
        assert.strictEqual(pages, 6)
        assert.strictEqual(current, 1)
        assert.strictEqual(docs.length, 10)
        done()
      })
    })
  })

  describe('#custom()', function () {
    var FooSchema = new Schema({ 
      count: Number
    , name: String
    })
    FooSchema.plugin(pagination, {
      defaultLimit: 20
    , defaultQuery: { count: { $gt: 10 } }
    , defaultFields: { count : 1 }
    , remember: true
    })
    var BarModel = db.model('paginateBar', FooSchema)
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should populate the db', function (done) {
      for (var x = 1; x <= 55; x++) {
        var instance = new BarModel({ 
          count: x
        , name: 'foobar'
        })
        instance.save(function(err, doc) {
          assert.strictEqual(err, null)
          if (doc.count == 55) done()
        })
      }
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.statics.paginate, 'function')
      assert.strictEqual(typeof FooSchema.statics.firstPage, 'function')
      assert.strictEqual(typeof FooSchema.statics.lastPage, 'function')
      done()
    })

    it('should paginate', function (done) {
      BarModel.paginate(function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 45)
        assert.strictEqual(pages, 3)
        assert.strictEqual(current, 1)
        assert.strictEqual(docs.length, 20)
        assert.equal(docs[0].count, 11)
        assert.strictEqual(docs[0].name, undefined)
        done()
      })
    })

    it('should paginate again', function (done) {
      BarModel.paginate({ 
        page: 2
      , limit: 5
      }, function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 45)
        assert.strictEqual(pages, 9)
        assert.strictEqual(current, 2)
        assert.strictEqual(docs.length, 5)
        done()
      })
    })

    it('should remember the last options', function (done) {
      BarModel.paginate({ 
        page: 7
      }, function (err, docs, total, pages, current) {
        assert.strictEqual(err, null)
        assert.strictEqual(total, 45)
        assert.strictEqual(pages, 9)
        assert.strictEqual(current, 7)
        assert.strictEqual(docs.length, 5)
        done()
      })
    })
  })
})
