
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , getdbrefs = require('../lib/getdbrefs')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('GetDBRefs', function () {
  describe('#default()', function () {
    var BarSchema = new Schema({
      other: { type: mongoose.Schema.ObjectId, ref: 'utilsOther' }
    , arr: [{ type: mongoose.Schema.ObjectId, ref: 'utilsArr' }]
    })

    var OtherSchema = new Schema({ str: String })
      , ArrSchema = new Schema({ bool: Boolean })
    
    BarSchema.plugin(getdbrefs)
    
    var BarModel = db.model('utilsBar', BarSchema)
      , OtherModel = db.model('utilsOther', OtherSchema)
      , ArrModel = db.model('utilsArr', ArrSchema)
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
      OtherModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
      ArrModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    var other = new OtherModel({ str: 'other' })
      , arr = new ArrModel({ bool: true })
      , bar = new BarModel({ arr: [arr], other: other })

    it('should have custom methods', function (done) {
      assert.strictEqual(typeof BarSchema.methods.getdbrefs, 'function')
      done()
    })
    
    it('should return an object with the dbrefs', function (done) {
      bar.getdbrefs(function (refs) {
        assert.strictEqual(typeof refs, 'object')
        assert.strictEqual(refs.utilsOther.toString(), other._id.toString())
        assert.strictEqual(refs.utilsArr[0].toString(), arr._id.toString())
        done()
      })
    })
    
    it('should still work with populate', function (done) {
      arr.save(function (err) {
        assert.strictEqual(err, null)

        other.save(function (err) {
          assert.strictEqual(err, null)

          bar.save(function (err) {
            assert.strictEqual(err, null)

            BarModel
              .find()
              .populate('utilsArr')
              .populate('utilsOther')
              .exec(function (err, docs) {
                assert.strictEqual(err, null)
                assert.strictEqual(docs.length, 1)
                docs[0].getdbrefs(function (refs) {
                  assert.strictEqual(refs.utilsOther.toString(), other._id.toString())
                  assert.strictEqual(refs.utilsArr[0].toString(), arr._id.toString())
                  done()
                })
              })
          })
        })
      })
    }) 
  })
})
