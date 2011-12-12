var mongoose = require('mongoose')
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
blog.title = "hello world 1"


blog.save(function(err){
  if(err) console.log('error')
  console.log('successful..')
  process.exit(0)
})

