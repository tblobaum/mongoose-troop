
/*!
 * Copyright(c) Tom Blobaum
 * MIT Licensed
 */

function sendemail (schema, options) {
  options = options || {}
  //schema.add({ acl: { type:[String], default: ['public'] } })

}

module.exports = sendemail

/*

schema.add({email: { default: 'none', lowercase: true, type: String, index: true }})
    
    
  
  schema.method('addAccess', function (key) {
    if (!access.call(this, key)) {
      this.acl.push(key)
      this.markModified('acl')
    }
  })
  
  schema.method('removeAccess', function (key) {
    if (access.call(this, key)) {
      this.acl.splice(this.acl.indexOf(key), 1) 
      this.markModified('acl')
    }
  })
  
  schema.method('access', access)
    
  function access (key, next) {
    var bool = this.acl.indexOf(key) >= 0
    next && next(bool)
    return bool
  }
  
  
  
  

var fs = require('fs')
  , result = {}

function resource (req, res, next) { 
  var thisname = names.indexOf(req.url)
  if (thisname !== -1) {
    res.end(document.bundle[ names[thisname] ])
  }
  else next()
}

function set (dirname, n, done) {
  var name = n || 'templates'
  names.push('/'+name+'.js')
  dirname = dirname || __dirname + '/view'
  walk(dirname, function () {
      done()
  }, result, 0)
  return this
}
 
function walk(dir, done, results) {
    //console.log(pending)
  done = done || function () {}
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    var pending = list.length //+ pending
    list.forEach(function(file2) {
      var file = dir + '/' + file2 
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results[file2]={}
          walk(file, done, results[file2]) 
        }
        else {
          var str = fs.readFileSync(file, 'utf-8')
          var key = file.replace(/^.*\//, '')
          key = key.match(/(.*)\.[^.]+$/)
          key = key[1]
          results[key] = str
          //console.log(pending)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}

module.exports = document


var resource = require('template-resource')
  , ejs = require('ejs')
  , Sendgrid = require('sendgrid-web')
  , sendgriduser = process.env['NODE_SENDGRID_USER']
  , sendgridkey = process.env['NODE_SENDGRID_KEY']
  , sendgrid = new Sendgrid({ user: sendgriduser, key: sendgridkey })

user.method('send_mail', function (options) {
  var templates = resource.result.emails
    //console.log(Object.keys(templates), templates)
  if (typeof options.data != 'object') throw new Error('data parameter is required')
  if (typeof options.type != 'string') throw new Error('type parameter is required')
  if (typeof this.email != 'string') throw new Error('user does not have a string email property')

  var arr = options.type.split('/')
  var i = arr.length
  var j = 0
  var tpl = _.extend({}, templates)

  while (i--) {
    tpl = tpl[arr[j]]
    j++
  }
  if (typeof tpl != 'string') throw new Error('template '+arr+' was not found')

  var Html = Mongoose.model('html')
  var instance = new Html()
  var data = _.extend({}, this, options.data)
    , body = ejs.render(tpl, data)
    , html = ejs.render(templates.index, {body:body, _id:instance._id})
    , params
  options.from = options.from || process.env['EMAIL']
  options.subject = data.subject || 'Hi ' +self.email

  params = { to: this.email
    , from: options.from
    , subject: options.subject
    , html: html }
  sendgrid.send(params, function (err) {
    if (err) throw new err
    instance.merge(params).save(function (e) {    
    })
  })
})
*/


