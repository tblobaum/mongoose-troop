
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
      , UserSchema = new Schema()
      , SessionSchema = new Schema()
      , BarSchema = new Schema({
          foo: { type: ObjectId, ref: FooSchema }
        , foos: [{ type: ObjectId, ref: FooSchema }]
        , another: [FooSchema]
        , simple: [String]
        , user: { 
            id: { type: Schema.ObjectId, ref: 'obfuscateUser' }
          , screen_name: { type: String, default: 'username' }
          , avatar: { 
              large: { type: String, default: 'large' }
            , small: { type: String, default: 'small' }
            }
          , deeper: {
              sid: { type: Schema.ObjectId, ref: 'obfuscateSession' }
            }
          }
        })
    
    // FooSchema.plugin(obfuscate)
    BarSchema.plugin(obfuscate)
    
    var FooModel = mongoose.model('obfuscateFoo', FooSchema)
      , SessionModel = mongoose.model('obfuscateSession', SessionSchema)
      , BarModel = mongoose.model('obfuscateBar', BarSchema)
      , UserModel = mongoose.model('obfuscateUser', UserSchema)
      , foo = new FooModel()
      , foo2 = new FooModel()
      , foo3 = new FooModel()
      , session = new SessionModel()
      , user = new UserModel()
      , bar = new BarModel({
          foo: foo
        , foos: [foo2, foo3]
        , another: [foo]
        , simple: ['hello']
        , user: {
            id: user._id
          , screen_name: 'bob'
          , avatar: {
              large: 'massive' 
            , small: 'tiny' 
            }
          , deeper: {
              sid: session._id
            }
          }
        })
    
    before(function () {
      FooModel.remove(function (err) {
        assert.strictEqual(err, null)
      })
    })

    it('should have custom properties', function (done) {
      assert.strictEqual(typeof BarSchema.virtuals.obfuscate, 'object')
      assert.strictEqual(typeof BarSchema.virtuals.deobfuscate, 'object')
      assert.strictEqual(typeof BarSchema.statics.encode, 'function')
      assert.strictEqual(typeof BarSchema.methods.encrypt, 'function')
      assert.strictEqual(typeof BarSchema.methods.decrypt, 'function')
      done()
    })

    var crypted
    it('should encrypt with getter', function (done) {
      crypted = bar.obfuscate
      
      assert.notStrictEqual(crypted._id.toString(), bar._id.toString())
      assert.notStrictEqual(crypted.foo.toString(), bar.foo.toString())
      assert.notStrictEqual(crypted.foos[0].toString(), foo2._id.toString())
      assert.notStrictEqual(crypted.foos[1].toString(), foo3._id.toString())
      assert.notStrictEqual(crypted.another[0]._id.toString(), foo._id.toString())
      assert.notStrictEqual(crypted.user.id.toString(), user._id.toString())
      assert.notStrictEqual(crypted.user.deeper.sid.toString(), session._id.toString())
      done()
    })

    it('should decrypt with setter', function (done) {
      var blah = new BarModel()
      blah.deobfuscate = crypted

      assert.strictEqual(blah._id.toString(), bar._id.toString())
      assert.strictEqual(blah.foo.toString(), bar.foo.toString())
      assert.strictEqual(blah.foos[0].toString(), foo2._id.toString())
      assert.strictEqual(blah.foos[1].toString(), foo3._id.toString())
      assert.strictEqual(blah.another[0]._id.toString(), foo._id.toString())
      assert.strictEqual(blah.user.id.toString(), user._id.toString())
      assert.strictEqual(blah.user.deeper.sid.toString(), session._id.toString())
      done()
    })

    var another
    it('should encrypt with model', function (done) {
      another = BarModel.encode(bar, true)

      assert.notStrictEqual(another._id.toString(), bar._id.toString())
      assert.notStrictEqual(another.foo.toString(), bar.foo.toString())
      assert.notStrictEqual(another.foos[0].toString(), foo2._id.toString())
      assert.notStrictEqual(another.foos[1].toString(), foo3._id.toString())
      assert.notStrictEqual(another.another[0]._id.toString(), foo._id.toString())
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
