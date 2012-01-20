
// Cleanup routine
// ---------------

var assert = require('assert')
  , db = require('./common').db

describe('#cleanup()', function() {
  it('should drop the database and disconnect', function(done) {
    db.connection.db.executeDbCommand({
      dropDatabase: 1
    }, function(err, result) {
      assert.strictEqual(err, null)
      db.disconnect()
      done()
    })
  })
})
