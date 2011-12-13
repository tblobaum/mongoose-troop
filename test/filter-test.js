var vows = require('vows')
  , assert = require('assert')
  , mongoose = require('mongoose')
  , filter = require('../lib/filter')

// DB setup  
mongoose.connect('mongodb://localhost/mongoose_troop')

// Setting up test schema
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var BlogPost = new Schema({
    author : String
  , title  : String
  , body   : String
  , date   : Date
})

// Registering the filter plugin with mongoose
// Note: Must be defined before creating schema object 
mongoose.plugin(filter,{debug: true})

var Blog = mongoose.model('BlogPost',BlogPost)

vows.describe('Filter unwanted attributes').addBatch({
  'when attribute not defined in schema':{
    topic: function(){
        var blog = new Blog({doesntBelong: 'filter this out'})
        blog.author = "butu5"
        blog.title = "Hello mongoose troops!!!"
        blog.save(this.callback)
    },

    'it should not be stored in collection': function(topic){
        Blog.findById(topic._id,function(err,post){
          if(err) console.log('error while retrieving the post')
          assert.equal(post.author, "butu5")
          assert.equal(post.title, "Hello mongoose troops!!!")
          assert.isUndefined(post.doesntBelong)
          process.exit(0)//TODO I should not forcefully exit
        })
    }
  }

}).run()
