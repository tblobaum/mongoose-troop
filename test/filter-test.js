var mongoose = require('mongoose')
var filter = require('../lib/filter')(mongoose,{debug:true})

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

var blog = new Blog({doesntBelong: 'filter this out'})
blog.title = "Testing doesn't Belong Test case 3 with Filter"

var options = {debug: true}
blog.filter()


blog.save(function(err){
  if(err) console.log('error')
  console.log('successful..')
  process.exit(0)
})



