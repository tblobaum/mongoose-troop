
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , trooputils = require('../lib/utils')
  , common = require('./support/common')
  , db = common.db
  , cleanup = common.cleanup
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Utils', function() {
  describe('#default()', function() {
    var BarSchema = new Schema({
      other: {
        type:mongoose.Schema.ObjectId
      , ref:'other'
      }
    , arr: [{
        type:mongoose.Schema.ObjectId
      , ref:'arr'
      }]
    })
    var OtherSchema = new Schema()
      , ArrSchema = new Schema()
    
    trooputils(BarSchema)
    
    var BarModel = mongoose.model('bar', BarSchema)
      , OtherModel = mongoose.model('other', OtherSchema)
      , ArrModel = mongoose.model('arr', ArrSchema)
      , othermodel = new OtherModel()
      , arrmodel = new ArrModel()
      , bar = new BarModel({arr: [arrmodel], other: othermodel })

    it('should have custom methods', function(done) {
      assert.ok(bar.merge)
      assert.ok(bar.removeDefaults)
      assert.ok(bar.getdbrefs)
      done()
    })
    
    it('should return an object with the dbrefs', function(done) {
      bar.getdbrefs(function (refs) {
        assert.notStrictEqual(Object.keys(refs), Array)
        done()
      })
    })
      
    it('should still work with populate', function(done) {
      arrmodel.save(function (err) {
        assert.strictEqual(err, null)
        othermodel.save(function (err) {
            assert.strictEqual(err, null)
          bar.save(function (err) {
            assert.strictEqual(err, null)
            BarModel
              .find()
              .populate('arr')
              .populate('other')
              .run(function (err, docs) {
                assert.strictEqual(err, null)
                docs[docs.length-1].getdbrefs(function (refs) {
                  assert.notStrictEqual(Object.keys(refs), ["other", "arr"])
                  done()
                })
              })
          })
        })
      })
    }) 
  })
})
