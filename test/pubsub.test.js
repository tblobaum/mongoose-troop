
// Dependencies
var util = require('util')
  , assert = require('assert')
  , redis = require('redis')
  , publish = redis.createClient()
  , subscribe = redis.createClient()
  , mongoose = require('mongoose')
  , pubSub = require('../lib/pubsub')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Publish', function () {
  describe('#default()', function () {
    var FooSchema = new Schema({ 
      title: String 
    })
    FooSchema.plugin(pubSub, {
      publish: publish
    , subscribe: subscribe
    })
    var FooModel = db.model('publishFoo', FooSchema)
      , foo = new FooModel({ title: 'monster trucks' })
      , expectedChan = 'publishfoos'
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    after(function () {
      subscribe.unsubscribe()
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.methods.publish, 'function')
      assert.strictEqual(typeof FooSchema.methods.getChannel, 'function')
      assert.strictEqual(typeof FooSchema.methods.on, 'function')
      assert.strictEqual(typeof FooSchema.methods.subscribe, 'function')
      assert.strictEqual(typeof FooSchema.methods.unsubscribe, 'function')
      assert.strictEqual(typeof FooSchema.statics.getChannel, 'function')
      assert.strictEqual(typeof FooSchema.statics.on, 'function')
      assert.strictEqual(typeof FooSchema.statics.subscribe, 'function')
      assert.strictEqual(typeof FooSchema.statics.unsubscribe, 'function')
      done()
    })

    it('should get an instance channel', function (done) {
      var chan = foo.getChannel()
      assert.strictEqual(typeof chan, 'string')
      assert.strictEqual(chan, expectedChan + ':' + foo._id)
      done()
    })

    it('should get a model channel', function (done) {
      var chan = FooModel.getChannel()
      assert.strictEqual(typeof chan, 'string')
      assert.strictEqual(chan, expectedChan)
      done()
    })

    it('should subscribe to the model', function (done) {
      FooModel.subscribe(function (err, result) {
        assert.strictEqual(err, null)
        assert.strictEqual(result, expectedChan)
        done()
      })
    })

    it('should subscribe to the instance', function (done) {
      foo.subscribe(function (err, result) {
        assert.strictEqual(err, null)
        assert.strictEqual(result, expectedChan + ':' + foo._id)
        done()
      })
    })

    it('should publish the instance', function (done) {
      FooModel.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan)
        assert.equal(msg.data._id, foo._id)
        assert.strictEqual(msg.data.title, foo.title)
        done()
      })

      FooModel.publish(foo, function (err, count) {
        assert.strictEqual(err, null)
        assert.strictEqual(count, 1)
      })
    })

    it('should publish the instance to itself', function (done) {
      foo.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan + ':' + foo._id)
        assert.equal(msg.data._id, foo._id)
        assert.strictEqual(msg.data.title, foo.title)
        done()
      })

      foo.publish(function (err, count) {
        assert.strictEqual(err, null)
        assert.strictEqual(count, 1)
      })
    })
  })

  describe('#custom()', function () {
    var FooSchema = new Schema({ 
      title: String 
    })
    FooSchema.plugin(pubSub, {
      publish: publish
    , subscribe: subscribe
    , auto: true
    , hook: 'pre'
    , seperator: '_'
    , prefix: 'test'
    , channel: 'mouse'
    })
    var BarModel = db.model('publishBar', FooSchema)
      , bar = new BarModel({ title: 'hey there' })
      , expectedChan = 'test_mouse'
    
    before(function () {
      BarModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })
    
    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.methods.publish, 'function')
      assert.strictEqual(typeof FooSchema.methods.getChannel, 'function')
      assert.strictEqual(typeof FooSchema.methods.on, 'function')
      assert.strictEqual(typeof FooSchema.methods.subscribe, 'function')
      assert.strictEqual(typeof FooSchema.methods.unsubscribe, 'function')
      assert.strictEqual(typeof FooSchema.statics.getChannel, 'function')
      assert.strictEqual(typeof FooSchema.statics.on, 'function')
      assert.strictEqual(typeof FooSchema.statics.subscribe, 'function')
      assert.strictEqual(typeof FooSchema.statics.unsubscribe, 'function')
      done()
    })

    it('should get an instance channel', function (done) {
      var chan = bar.getChannel()
      assert.strictEqual(typeof chan, 'string')
      assert.strictEqual(chan, expectedChan + '_' + bar._id)
      done()
    })

    it('should get a model channel', function (done) {
      var chan = BarModel.getChannel()
      assert.strictEqual(typeof chan, 'string')
      assert.strictEqual(chan, expectedChan)
      done()
    })

    it('should subscribe to the model', function (done) {
      BarModel.subscribe(function (err, result) {
        assert.strictEqual(err, null)
        assert.strictEqual(result, expectedChan)
        done()
      })
    })

    it('should subscribe to the instance', function (done) {
      bar.subscribe(function (err, result) {
        assert.strictEqual(err, null)
        assert.strictEqual(result, expectedChan + '_' + bar._id)
        done()
      })
    })

    it('should publish the instance', function (done) {
      BarModel.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan)
        assert.equal(msg.data._id, bar._id)
        assert.strictEqual(msg.data.title, bar.title)
        done()
      })

      BarModel.publish(bar, function (err, count) {
        assert.strictEqual(err, null)
        assert.strictEqual(count, 1)
      })
    })

    it('should unsubscribe the model', function (done) {
      BarModel.unsubscribe(function (err, result) {
        assert.strictEqual(err, null)
        done()
      })
    })

    it('should publish the instance to itself', function (done) {
      bar.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan + '_' + bar._id)
        assert.equal(msg.data._id, bar._id)
        assert.strictEqual(msg.data.title, bar.title)
        done()
      })

      bar.publish(function (err, count) {
        assert.strictEqual(err, null)
        assert.strictEqual(count, 1)
      })
    })

    it('should unsubscribe the instance', function (done) {
      bar.unsubscribe(function (err, result) {
        assert.strictEqual(err, null)
        done()
      })
    })
  })

  describe('#manual()', function () {
    var FooSchema = new Schema({ 
      title: String 
    })
    FooSchema.plugin(pubSub, {
      publish: publish
    , subscribe: subscribe
    , auto: true
    , hook: 'pre'
    , seperator: '-'
    , prefix: 'breaking'
    , channel: 'bad'
    })
    var BlahModel = db.model('publishBlah', FooSchema)
      , blah = new BlahModel({ title: 'hey there' })
      , expectedChan = 'breaking-bad'
    
    it('should trigger a subscribe event', function (done) {
      BlahModel.on('subscribe', function (chan, count) {
        assert.strictEqual(chan, expectedChan)
        assert.strictEqual(count, 1)
        done()
      })
      BlahModel.subscribe(function (err, chan) {
        assert.strictEqual(err, null)
        assert.strictEqual(chan, expectedChan)
      })
    })

    it('should publish on save', function (done) {
      BlahModel.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan)
        assert.equal(msg.options.method, 'save')
        assert.equal(msg.data._id, blah._id)
        assert.strictEqual(msg.data.title, blah.title)
        done()
      })

      blah.save(function (err, doc) {
        assert.strictEqual(err, null)
      })
    })

    it('should trigger an unsubscribe event', function (done) {
      BlahModel.on('unsubscribe', function (chan, count) {
        assert.strictEqual(chan, expectedChan)
        assert.strictEqual(count, 0)
        done()
      })
      BlahModel.unsubscribe(function (err, chan) {
        assert.strictEqual(err, null)
        assert.strictEqual(chan, expectedChan)
      })
    })
  })

  // describe('#init()', function () {
  //   var FooSchema = new Schema({ 
  //     title: String 
  //   })
  //   FooSchema.plugin(pubSub, {
  //     publish: publish
  //   , subscribe: subscribe
  //   , auto: true
  //   , hook: 'post'
  //   })
  //   var TestModel = db.model('publishTest', FooSchema)
  //     , expectedChan = 'publishtests'

  //   it('should publish on init', function (done) {
  //     TestModel.on('message', function (chan, message) {
  //       var msg = JSON.parse(message)
  //       assert.strictEqual(typeof message, 'string')
  //       assert.strictEqual(typeof msg, 'object')
  //       assert.strictEqual(typeof msg.options, 'object')
  //       assert.strictEqual(typeof msg.data, 'object')
  //       assert.strictEqual(chan, expectedChan)
  //       assert.equal(msg.options.method, 'init')
        
  //       TestModel.unsubscribe(function (err, chan) {
  //         assert.strictEqual(err, null)
  //         assert.strictEqual(chan, expectedChan)
  //         done()
  //       })
  //     })

  //     var instance = new TestModel({title: 'find'})
  //     instance.save(function (err, doc) {
  //       assert.strictEqual(err, null)
  //       TestModel.subscribe(function (err, chan) {
  //         assert.strictEqual(err, null)
  //         assert.strictEqual(chan, expectedChan)
  //         TestModel.findOne({title: 'find'}, function (err, result) {
  //           assert.strictEqual(err, null)
  //         })
  //       })
  //     })
  //   })
  // })

  describe('#remove()', function () {
    var FooSchema = new Schema({ 
      title: String 
    })
    FooSchema.plugin(pubSub, {
      publish: publish
    , subscribe: subscribe
    , auto: true
    , hook: 'pre'
    })
    var HelloModel = db.model('publishHello', FooSchema)
      , expectedChan = 'publishhellos'
    
    it('should publish on remove', function (done) {
      HelloModel.on('message', function (chan, message) {
        var msg = JSON.parse(message)
        assert.strictEqual(typeof message, 'string')
        assert.strictEqual(typeof msg, 'object')
        assert.strictEqual(typeof msg.options, 'object')
        assert.strictEqual(typeof msg.data, 'object')
        assert.strictEqual(chan, expectedChan)
        assert.equal(msg.options.method, 'remove')
        
        HelloModel.unsubscribe(function (err, chan) {
          assert.strictEqual(err, null)
          assert.strictEqual(chan, expectedChan)
          done()
        })
      })

      var instance = new HelloModel()
      instance.save(function (err, doc) {
        assert.strictEqual(err, null)
        HelloModel.subscribe(function (err, chan) {
          doc.remove(function (err, doc) {
            assert.strictEqual(err, null)
          })
        })
      })
    })
  })
})
