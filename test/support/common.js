
var mongoose = require('mongoose')
  , db = mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/mongoose_troop')

module.exports = {
  db: db
}
