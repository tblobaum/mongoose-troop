
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
    
    var BarSchema = new Schema({
      foo: { type: ObjectId, ref: FooSchema }
    , foos: [{ type: ObjectId, ref: FooSchema }]
    , nested: {
        foo: { type: ObjectId, ref: FooSchema }
      , foos: [{ type: ObjectId, ref: FooSchema }]
      , another: [FooSchema]
    }
    , another: [FooSchema]
    , simple: [String]
    , user: { 
        id: { type: Schema.ObjectId, ref: 'obfuscateUser' }
      , screen_name: { type: String }
      , avatar: { 
          large: { type: String }
        , small: { type: String }
        }
      , deeper: {
          sid: { type: Schema.ObjectId, ref: 'obfuscateSession' }
        }
      }
    })
    
    // FooSchema.plugin(obfuscate)
    BarSchema.plugin(obfuscate)
    
    var FooModel = db.model('obfuscateFoo', FooSchema)
      , SessionModel = db.model('obfuscateSession', SessionSchema)
      , BarModel = db.model('obfuscateBar', BarSchema)
      , UserModel = db.model('obfuscateUser', UserSchema)
      , foo = new FooModel()
      , foo2 = new FooModel()
      , foo3 = new FooModel()
      , session = new SessionModel()
      , user = new UserModel()
    
    var bar = new BarModel({
      foo: foo
    , foos: [foo2, foo3]
    , another: [foo]
    , nested: {
        foo: foo
      , foos: [foo2, foo3]
      , another: [foo]
    }
    , simple: ['hello']
    , user: {
        id: user._id
      , screen_name: 'bob'
      , avatar: { large: 'massive', small: 'tiny' }
      , deeper: { sid: session._id }
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

    var cryptedIdTest
      , idTest
    
    it('should encrypt ObjectID with getter', function (done) {
      idTest = new BarModel()
      cryptedIdTest = idTest.obfuscate
      assert.notStrictEqual(cryptedIdTest._id.toString(), idTest._id.toString())
      done()
    })

    it('should decrypt ObjectID with setter', function (done) {
      var idTestTwo = new BarModel()
      idTestTwo.deobfuscate = cryptedIdTest
      assert.strictEqual(idTestTwo._id.toString(), idTest._id.toString())
      done()
    })

    var cryptedDBRefTest
      , dBRefTest
    
    it('should encrypt a DBRef with getter', function (done) {
      dBRefTest = new BarModel({ foo: foo })
      cryptedDBRefTest = dBRefTest.obfuscate
      assert.notStrictEqual(cryptedDBRefTest.foo.toString(), dBRefTest.foo.toString())
      done()
    })

    it('should decrypt the DBRef with setter', function (done) {
      var dbRefTestTwo = new BarModel()
      dbRefTestTwo.deobfuscate = cryptedDBRefTest
      assert.strictEqual(dbRefTestTwo.foo.toString(), dBRefTest.foo.toString())
      done()
    })

    var cryptedArrayDBRefTest
    it('should encrypt an array of DBRefs with getter', function (done) {
      var arrayDBRefTest = new BarModel({ foos: [foo2, foo3] })
      cryptedArrayDBRefTest = arrayDBRefTest.obfuscate
      assert.notStrictEqual(cryptedArrayDBRefTest.foos[0].toString(), foo2._id.toString())
      assert.notStrictEqual(cryptedArrayDBRefTest.foos[1].toString(), foo3._id.toString())
      done()
    })

    it('should decrypt an array of DBRefs with setter', function (done) {
      var arrayDBRefTestTwo = new BarModel()
      arrayDBRefTestTwo.deobfuscate = cryptedArrayDBRefTest
      assert.strictEqual(arrayDBRefTestTwo.foos[0].toString(), foo2._id.toString())
      assert.strictEqual(arrayDBRefTestTwo.foos[1].toString(), foo3._id.toString())
      done()
    })

    var cryptedNestedArrayDBRefTest
    it('should encrypt a nested array of DBRefs with getter', function (done) {
      var nestedArrayDBRefTest = new BarModel({ nested: { foos: [foo2, foo3] } })
      cryptedNestedArrayDBRefTest = nestedArrayDBRefTest.obfuscate
      assert.notStrictEqual(cryptedNestedArrayDBRefTest.nested.foos[0].toString(), foo2._id.toString())
      assert.notStrictEqual(cryptedNestedArrayDBRefTest.nested.foos[1].toString(), foo3._id.toString())
      done()
    })

    it('should decrypt a nested array of DBRefs with setter', function (done) {
      var nestedArrayDBRefTestTwo = new BarModel()
      nestedArrayDBRefTestTwo.deobfuscate = cryptedNestedArrayDBRefTest
      assert.strictEqual(nestedArrayDBRefTestTwo.nested.foos[0].toString(), foo2._id.toString())
      assert.strictEqual(nestedArrayDBRefTestTwo.nested.foos[1].toString(), foo3._id.toString())
      done()
    })

    var cryptedArrayEmbeddedTest
    it('should encrypt an array of embedded docs with getter', function (done) {
      var arrayEmbeddedDBRefTest = new BarModel({ another: [foo2] })
      cryptedArrayEmbeddedTest = arrayEmbeddedDBRefTest.obfuscate
      assert.notStrictEqual(cryptedArrayEmbeddedTest.another[0]._id.toString(), foo2._id.toString())
      done()
    })

    it('should decrypt an array of embedded docs with setter', function (done) {
      var arrayEmbeddedDBRefTestTwo = new BarModel()
      arrayEmbeddedDBRefTestTwo.deobfuscate = cryptedArrayEmbeddedTest
      assert.strictEqual(arrayEmbeddedDBRefTestTwo.another[0]._id.toString(), foo2._id.toString())
      done()
    })

    var cryptedNestedArrayEmbeddedTest
    it('should encrypt a nested array of embedded docs with getter', function (done) {
      var nestedArrayEmbeddedDBRefTest = new BarModel({ nested: { another: [foo2] } })
      cryptedNestedArrayEmbeddedTest = nestedArrayEmbeddedDBRefTest.obfuscate
      assert.notStrictEqual(cryptedNestedArrayEmbeddedTest.nested.another[0]._id.toString(), foo2._id.toString())
      done()
    })

    it('should decrypt a nested array of embedded docs with setter', function (done) {
      var nestedArrayEmbeddedDBRefTestTwo = new BarModel()
      nestedArrayEmbeddedDBRefTestTwo.deobfuscate = cryptedNestedArrayEmbeddedTest
      assert.strictEqual(nestedArrayEmbeddedDBRefTestTwo.nested.another[0]._id.toString(), foo2._id.toString())
      done()
    })

    var cryptedEmbeddedSchemaTest
    it('should encrypt an embedded schema with getter', function (done) {
      var embeddedSchemaTest = new BarModel({ 
        user: {
          id: user._id
        , screen_name: 'bob'
        , avatar: { large: 'massive', small: 'tiny' }
        , deeper: { sid: session._id }
        } 
      })
      cryptedEmbeddedSchemaTest = embeddedSchemaTest.obfuscate
      assert.notStrictEqual(cryptedEmbeddedSchemaTest.user.id.toString(), user._id.toString())
      assert.notStrictEqual(cryptedEmbeddedSchemaTest.user.deeper.sid.toString(), session._id.toString())
      done()
    })

    it('should decrypt an embedded schema with setter', function (done) {
      var embeddedSchemaTestTwo = new BarModel()
      embeddedSchemaTestTwo.deobfuscate = cryptedEmbeddedSchemaTest
      assert.strictEqual(embeddedSchemaTestTwo.user.id.toString(), user._id.toString())
      assert.strictEqual(embeddedSchemaTestTwo.user.deeper.sid.toString(), session._id.toString())
      done()
    })

    var crypted
    it('should encrypt all with getter', function (done) {
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
    it('should decrypt all with setter', function (done) {
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
