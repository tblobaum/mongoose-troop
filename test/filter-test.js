var mongoose = require('mongoose')
var filter = require('../lib/filter')

mongoose.connect('mongodb://localhost/mongoose_troop')

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var BlogPost = new Schema({
    author : ObjectId
  , title  : String
  , body   : String
  , date   : Date
})


var Blog = mongoose.model('BlogPost',BlogPost)

var blog = new Blog()
blog.title = "hello world 3"

var options = {debug: true}
filter(BlogPost,options)


blog.save(function(err){
  if(err) console.log('error')
  console.log('successful..')
  process.exit(0)
})



