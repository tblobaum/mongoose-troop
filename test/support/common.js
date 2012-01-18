
var mongoose = require('mongoose')
  , assert = require('assert')
  , db = mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/mongoose_troop')

function cleanup() {
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
}

module.exports = {
  db: db
, cleanup: cleanup
}
