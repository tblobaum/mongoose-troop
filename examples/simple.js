var Troop = require('mongoose-troop')
  , Mongoose = require('mongoose')
  , publish = require('redis').createClient()
  , subscribe = require('redis').createClient()

var User = new mongoose.schema({
  name: String
, phone: String
})

User.plugin(Troop.basicAuth)
User.plugin(Troop.timestamp)
User.plugin(Troop.keywords)
User.plugin(Troop.publish, {
  publish: publish
, subscribe: subscribe
})
User.plugin(Troop.slugify)
User.plugin(Troop.rest)

Mongoose.plugin(Troop.upsert)
Mongoose.plugin(Troop.removeDefaults)
Mongoose.plugin(Troop.merge)

Mongoose.model('user', User)
