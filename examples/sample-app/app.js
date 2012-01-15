var mongoose = require('mongoose')
  , troop = require('../../')
  , db = mongoose.connect('mongodb://localhost/mongoose_troop')
  , UserSchema = new mongoose.Schema()

UserSchema.plugin(troop.basicAuth)
UserSchema.plugin(troop.acl)

db.model('user', UserSchema)

var User = db.model('user')

User.register({
  username: 'foo'
, password: 'bar'
}, function() {
  // ...
})

User.authenticate('foo', 'bar', function(err, user) {
  user.add_access('dashboard')
  console.log(user)
})

User.findOne({ username: 'foo'}, function(err, doc) {
  if (err || !doc) return
  doc.setPassword('foobar', function(err) {
    if (err) return
    doc.authenticate('foobar', function() {
      // ...
    })
  })
})
