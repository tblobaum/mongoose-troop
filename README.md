
Mongoose Troop
==============

A collection of utility plugins for mongoose

Example
-------

```javascript
var Troop = require('mongoose-troop')
  , Mongoose = require('mongoose')
  , client = require('redis').createClient()

var User = new mongoose.schema({ 
  name: String
, phone: String
})

User.plugin(Troop.basicAuth)
User.plugin(Troop.addCreatedAndModified)
User.plugin(Troop.keywords)
User.plugin(Troop.publishOnSave, { redis: client })
User.plugin(Troop.slugify)
User.plugin(Troop.rest)

Mongoose.plugin(Troop.upsert)
Mongoose.plugin(Troop.removeDefaults)
Mongoose.plugin(Troop.merge)

Mongoose.model('User', User)
````


basicAuth
=========

Simple authentication plugin

##Options

* `loginPath` schema path for username/login (optional, default `username`)
* `hashPath` schema path to hashed password (optional, default `hash`)
* `workFactor` bcrypt work factor (optional, default `10`)

##Methods

###instance.authenticate(password, callback)

Authenticate a mongoose document

###instance.setPassword(password, callback)

Set the password for a mongoose document

###model.authenticate(username, password, callback)

Authenticate a user on the model level

###model.register(attributes, callback)

Create a new user with given attributes

##Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()
  , UserSchema = new mongoose.Schema()

UserSchema.plugin(troop.basicAuth)

db.model('user', UserSchema)

var User = db.model('user')

User.register({
  username: 'foo'
, password: 'bar'
}, function() {
  // ...
})

User.authenticate('foo', 'bar', function(err, doc) {
  // ...
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
````


addCreatedAndModified
=====================

Adds a `created` and `modified` property to the schema, updating the timestamps as expected

##Options

* `createdPath` schema path for created timestamp (optional, default `created`)
* `modifiedPath` schema path for modified timestamp (optional, default `modified`)

##Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , FooSchema = new mongoose.Schema()

FooSchema.plugin(troop.addCreatedAndModified)
````


slugify
=======

Turn a string based field into a url friendly slug

Converts `this is a title` to `this-is-a-title`

##Options

* `target` schema path for slug destination (optional, default `slug`)
* `source` schema path for slug content (optional, default `title`)
* `maxLength` maximum slug length (optional, default `50`)
* `spaceChar` space replacement character (optional, default `-`)
* `invalidChar` invalid character replacement (optional, default ``)
* `override` override slug field on source path change (optional, default `false`)

##Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , FooSchema = new mongoose.Schema()

FooSchema.plugin(troop.slugify)

var instance = new FooSchema({title: 'well hello there!'})

console.log(instance.slug) // `well-hello-there`
````


keywords
========

Keyword extraction/creation plugin, can be used as a simple substitute of a full
search indexing package.

Turns `foo is a bar` into `['foo', 'is', 'bar']`

###Options

* `target` schema path for keyword destination (optional, default `keywords`)
* `source` schema path for extracting keywords
* `minLength` minimum string length to be used as a keyword (optional, default `2`)

##Methods

###instance.extractKeywords(str)

Manually calculate a keyword array with a given string

##Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , FooSchema = new mongoose.Schema({
      text: String
    })

FooSchema.plugin(troop.keywords, {
  source: 'text'
})

var instance = new FooSchema({text: 'i am the batman'})

console.log(instance.keywords) // `['am', 'the', 'batman']`

FooSchema.find({ keywords: { $in: [ 'batman' ] }}, function(docs) {
  // ...
})
````


removeDefaults
==============

Remove all of the default values from your model instance.

`instance.removeDefaults().save()`

##Options

* `debug` verbose logging of current actions (optional, default `false`)

upsert
======

A more intuitive upsert method for modifying your document without first retrieving it.

```javascript
var doc = { 
  _id: '4e6121...'
, name: 'Your Name'
, email: 'email@gmail.com'
}

// if doc contains an _id field just send it through
new User(doc).upsert()

// if doc has an _id field, but you want to check the error yourself you 
// can supply a callback as a single argument
new User(doc).upsert(function (e) {
  if (e) console.log(e)
})

// if doc does not have an _id field, but you have access to 
// it as a string, you can use this
new User(doc).upsert('4e6121...')

// or you can supply the _id as a string for the first field and a callback
new User(doc).upsert('4e6121...', function (e) {
  if (e) console.log(e)
})

// supply an object as the first argument, which contains the search
// query or what to look for, and it will be updated with doc
new User(doc).upsert({apikey: '81da51e88199139e0e9cc56464607411' }, function (e) {
  if (e) console.log(e)
})

// if doc contains an _id field, and you would like to make changes 
// to dirty data but *not* update the entire doc, you can pass in the changes
// as the first parameter with a callback
new User(doc).upsert({$set : { name: 'name change' } }, function (e) {
  if (e) console.log(e)
})

// you can also pass in three arguments, what to look for, what to 
// update, and the callback
new User(doc).upsert({apikey: '81da51e88199139e0e9cc56464607411' }, {$set : { name: 'new name' } }, function (e) {
  if (e) console.log(e)
})
````


merge
=====

Merge JSON into your object more easily.

```javascript
instance.merge({title:'A new title', description:'A new description'}).save()
````

##Options

* `debug` verbose logging of current actions (optional, default `false`)


publishOnSave
=============

Pass in a redis publisher connection to publish a model to redis everytime it is saved. Can intuitively publish only dirty/new data. Will eventually work with zeromq.

You can also explicitly publish a model instance.

```javascript
mongoose.plugin(troop.publishOnSave, {redis:redis})
instance.publish()
````

##Options

* `redis` redis instance to be used for publishing
* `debug` verbose logging of current actions (optional, default `false`)


rest
====

##Options

* `debug` verbose logging of current actions (optional, default `false`)

Create a RESTful controller for your models for use with flatiron/director, express, dnode or socket.io


License
=======

(The MIT License)

Copyright (c) 2011-2012 Tom Blobaum <tblobaum@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


