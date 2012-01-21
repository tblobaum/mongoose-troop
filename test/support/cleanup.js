
// Cleanup routine
// ---------------

var assert = require('assert')
  , db = require('./common').db
  , dropDatabase = require('../../helpers').dropDatabase
  , dropCollections = require('../../helpers').dropCollections

describe('#cleanup()', function() {
  it('should drop the database and disconnect', function(done) {
    dropDatabase(db, function(err, result) {
      assert.strictEqual(err, null)
      done()
    })
  })
})
