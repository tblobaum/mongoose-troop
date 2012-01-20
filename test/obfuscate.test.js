
// Dependencies
var util = require('util')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , obfuscate = require('../lib/obfuscate')
  , common = require('./support/common')
  , db = common.db
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

// Run tests
describe('Obfuscate', function () {
  describe('#default()', function () {
    var FooSchema = new Schema()
      , BarSchema = new Schema({
          foo: { type: ObjectId, ref: FooSchema }
        , foos: [{ type: ObjectId, ref: FooSchema }]
        , another: [FooSchema]
        , simple: [String]
        })
    
    FooSchema.plugin(obfuscate)
    BarSchema.plugin(obfuscate)
    
    var FooModel = mongoose.model('obfuscateFoo', FooSchema)
      , BarModel = mongoose.model('obfuscateBar', BarSchema)
      , foo = new FooModel()
      , foo2 = new FooModel()
      , foo3 = new FooModel()
      , bar = new BarModel({
          foo: foo
        , foos: [foo2, foo3]
        , another: [foo]
        , simple: ['hello']
        })
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof FooSchema.virtuals.obfuscate, 'object')
      assert.strictEqual(typeof FooSchema.virtuals.deobfuscate, 'object')
      assert.strictEqual(typeof FooSchema.statics.encode, 'function')
      assert.strictEqual(typeof FooSchema.methods.encrypt, 'function')
      assert.strictEqual(typeof FooSchema.methods.decrypt, 'function')
      done()
    })

    var crypted
    it('should encrypt with getter', function (done) {
      crypted = bar.obfuscate
      console.log('crypted: ', crypted)
      assert.notStrictEqual(crypted._id, bar._id.toString())
      assert.notStrictEqual(crypted.foo, bar.foo.toString())
      assert.notStrictEqual(crypted.foos[0], foo2._id.toString())
      assert.notStrictEqual(crypted.foos[1], foo3._id.toString())
      assert.notStrictEqual(crypted.another[0]._id, foo._id.toString())
      done()
    })

    it('should decrypt with setter', function (done) {
      var blah = new BarModel()
      blah.deobfuscate = crypted
      console.log('decrypted: ', blah)
      assert.strictEqual(blah._id.toString(), bar._id.toString())
      assert.strictEqual(blah.foo.toString(), bar.foo.toString())
      assert.strictEqual(blah.foos[0].toString(), foo2._id.toString())
      assert.strictEqual(blah.foos[1].toString(), foo3._id.toString())
      assert.strictEqual(blah.another[0]._id.toString(), foo._id.toString())
      done()
    })

    var another
    it('should encrypt with model', function (done) {
      another = BarModel.encode(bar, true)

      assert.notStrictEqual(another._id, bar._id.toString())
      assert.notStrictEqual(another.foo, bar.foo.toString())
      assert.notStrictEqual(another.foos[0], foo2._id.toString())
      assert.notStrictEqual(another.foos[1], foo3._id.toString())
      assert.notStrictEqual(another.another[0]._id, foo._id.toString())
      done()
    })

    it('should decrypt with model', function (done) {
      var ahoy = BarModel.encode(another, false)

      assert.strictEqual(ahoy._id.toString(), bar._id.toString())
      assert.strictEqual(ahoy.foo.toString(), bar.foo.toString())
      assert.strictEqual(ahoy.foos[0].toString(), foo2._id.toString())
      assert.strictEqual(ahoy.foos[1].toString(), foo3._id.toString())
      assert.strictEqual(ahoy.another[0]._id.toString(), foo._id.toString())
      done()
    })
  })
})
