
// Cleanup routine
// ---------------

var assert = require('assert')
	, mongodb = require('mongodb')
  , db = require('./common').db
  , dropDatabase = require('../../helpers').dropDatabase
  , dropCollections = require('../../helpers').dropCollections

describe('#cleanup()', function() {
  it('should drop the database and disconnect', function(done) {
    new mongodb.Db('mongoose_troop', new mongodb.Server('127.0.0.1', 27017, {}), {w: 1}).open(function (err, client) {
      assert.strictEqual(err, null)
      client.dropDatabase(done)
    })
  })
})
