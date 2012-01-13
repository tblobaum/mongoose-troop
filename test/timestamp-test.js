
// Dependencies
var vows = require('vows')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , timestamp = require('../lib/timestamp')
  , util = require('util')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , db = mongoose.connect('mongodb://localhost/mongoose_troop')

// Run tests
vows
  .describe('Timestamp plugin')
  .addBatch({
    'registered by default': {
      topic: function() {
        var FooSchema = new Schema()
        FooSchema.plugin(timestamp)
        var Foo = mongoose.model('foo', FooSchema)
          , bar = new Foo()
        
        bar.save(this.callback)
      }
    , 'it should create the default attributes': function(err, doc) {
        assert.isNull(err)
        assert.equal(util.isDate(doc.created), true)
        assert.equal(util.isDate(doc.modified), true)
        doc.remove()
      }
    }
  , 'registered with options': {
      topic: function() {
        var FooSchema = new Schema()
        FooSchema.plugin(timestamp, {
          createdPath: 'oh'
        , modifiedPath: 'hai'
        , useVirtual: false
        })
        var Foo = mongoose.model('foo2', FooSchema)
          , bar = new Foo()
        
        bar.save(this.callback)
      }
    , 'it should create custom attributes': function(err, doc) {
        assert.isNull(err)
        assert.equal(util.isDate(doc.oh), true)
        assert.equal(util.isDate(doc.hai), true)
        doc.remove(function() {
          db.disconnect()
        })
      }
    }
  })
  .run()
