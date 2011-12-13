var vows = require('vows')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , timestamp = require('../lib/timestamp')

// DB setup  
mongoose.connect('mongodb://localhost/mongoose_troop')

// Setting up test schema
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var BlogPost = new Schema({
    author : String
  , title  : String
  , body   : String
})

console.log('registering the plugin...')
// Registering the timestamp plugin with mongoose
// Note: Must be defined before creating schema object 
mongoose.plugin(timestamp,{debug: true})

var Blog = mongoose.model('BlogPost',BlogPost)

vows.describe('Add createAt and modifiedAt').addBatch({
  'when this plugin registered by default':{
    topic: function(){
      var blog = new Blog()
      blog.author = "butu5"
      blog.title = "Mongoose troops!!! timestamp plugin "
      blog.save(this.callback)
    },

    'it should not be stored in collection': function(topic){
      console.log(topic)
    }
  }
}).run()
