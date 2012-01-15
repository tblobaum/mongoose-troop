
var Mongoose = require('mongoose')
  , Troop = require('../../')
  , db = Mongoose.connect('mongodb://localhost/mongoose_troop')
  , UserSchema = new Mongoose.Schema()

UserSchema.plugin(Troop.basicAuth)
UserSchema.plugin(Troop.acl)

db.model('user', UserSchema)

var User = db.model('user')

User.register({username: 'foo', password: 'bar'}, function(e, user) {
  if (e) return console.log(e)
  user.addAccess('dashboard')
})

User.authenticate('foo', 'bar', function(err, user) {
  
  user.access('dashboard', function (bool) {
  
    console.log(user)
  })
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
