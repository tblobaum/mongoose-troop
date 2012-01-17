
// Dependencies
delete require('mongoose')

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
describe('troop utility functions', function() {
  describe('#default()', function() {
    var BarSchema = new Schema({
      other: {type:mongoose.Schema.ObjectId, ref:'other'},
      arr: [{type:mongoose.Schema.ObjectId, ref:'arr'}]
    })
    var OtherSchema = new Schema()
    var ArrSchema = new Schema()
    
    trooputils(BarSchema)
    mongoose.model('bar', BarSchema)
    mongoose.model('other', OtherSchema)
    mongoose.model('arr', ArrSchema)
    
    var BarModel = mongoose.model('bar')
    var OtherModel = mongoose.model('other')
    var ArrModel = mongoose.model('arr')
    var othermodel = new OtherModel()
    var arrmodel = new ArrModel()
    var bar = new BarModel({arr: [arrmodel], other: othermodel })

    it('should have a method called merge', function(done) {
      assert.ok(bar.merge)
      done()
    })
    
    it('should have a method called removeDefaults', function(done) {
      assert.ok(bar.removeDefaults)
      done()
    })
    
    it('should have a method called getdbrefs', function(done) {
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
      arrmodel.save(function (e) {
        othermodel.save(function (e) {
          bar.save(function (e) {
            BarModel
              .find()
              .populate('arr')
              .populate('other')
              .run(function (e, docs) {
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
