
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , dbrefs = require('../lib/dbrefs')
  , common = require('./common')
  , db = common.db
  , cleanup = common.cleanup
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('dbrefs utility functions', function() {
  describe('#default()', function() {
  
    mongoose.plugin(dbrefs)
    
    var FooSchema = new Schema({
      other: {type:mongoose.Schema.ObjectId, ref:'other'},
      arr: [{type:mongoose.Schema.ObjectId, ref:'arr'}]
    })
    var OtherSchema = new Schema()
    var ArrSchema = new Schema()
    
    var FooModel = mongoose.model('foo', FooSchema)
    var OtherModel = mongoose.model('other', OtherSchema)
    var ArrModel = mongoose.model('arr', ArrSchema)
    
    var foo = new FooModel({arr: [new ArrModel()], other: new OtherModel() })
    
    foo.arr.push(new ArrModel())
    
    it('should return an object with the dbrefs ', function(done) {
      foo.getdbrefs(function (refs) {
        console.log(refs)
        assert.notStrictEqual(Object.keys(refs), Array)
        done()
      })
    })
    
  })

})
