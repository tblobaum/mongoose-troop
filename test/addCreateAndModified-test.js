var vows = require('vows')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , timestamp = require('../lib/addCreatedAndModified')
  , util = require('util')

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

// Registering the timestamp plugin with mongoose
// Note: Must be defined before creating schema object 
mongoose.plugin(timestamp,{debug: true})

var Blog = mongoose.model('BlogPost',BlogPost)

vows.describe('Add create and modified').addBatch({
  'when this plugin registered by default':{
    topic: function(){
      var blog = new Blog()
      blog.author = "butu5"
      blog.title = "Mongoose troops!!! timestamp plugin "
      blog.save(this.callback)
    },

    'it should create created and modified attribute': function(topic){
      assert.equal(util.isDate(topic.created),true)
      assert.equal(util.isDate(topic.modified),true)
    }
  }
}).run()
