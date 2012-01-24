
# Mongoose Troop [![Build Status](https://secure.travis-ci.org/tblobaum/mongoose-troop.png)](http://travis-ci.org/tblobaum/mongoose-troop) 

A collection of handy plugins for mongoose

## Contents
* <a href="#Troop.acl"> acl </a>
* <a href="#Troop.basicAuth"> basicAuth </a> (simple authentication and registration)
* <a href="#Troop.timestamp"> timestamp </a> (automatic created and modified timestamps)
* <a href="#Troop.slugify"> slugify </a> (url-friendly copies of string properties)
* <a href="#Troop.keywords"> keywords </a> (search-friendly array of stemmed words from string properties)
* <a href="#Troop.pubsub"> pubsub </a> (message passing)
* <a href="#Troop.pagination"> pagination </a> (query pagination)
* <a href="#Troop.rest"> rest </a> (http or rpc controller)
* <a href="#Troop.obfuscate"> obfuscate </a> (objectID encryption / decryption)
* <a href="#Troop.merge"> merge </a> (merge a document into another)
* <a href="#Troop.removeDefaults"> removeDefaults </a> (remove default values from a document)
* <a href="#Troop.getdbrefs"> getdbrefs </a> (find all document DBRefs)

***

# <a name="Troop.acl" href="#Troop.acl">acl</a>
Simple access control list

## Methods

### instance.addAccess(key)

Add `key` access to a Model instance

### instance.removeAccess(key)

Remove `key` access to a Model instance

### instance.access(key [, callback])

Return or callback a boolean


***

# <a name="Troop.basicAuth" href="#Troop.basicAuth">basicAuth</a>

Simple authentication plugin

## Options

* `loginPath` schema path for username/login (optional, default `username`)
* `hashPath` schema path to hashed password (optional, default `hash`)
* `workFactor` bcrypt work factor (optional, default `10`)

## Methods

### instance.authenticate(password, callback)

Authenticate a mongoose document

### instance.setPassword(password, callback)

Set the password for a mongoose document

### model.authenticate(username, password, callback)

Authenticate a user on the model level

### model.register(attributes, callback)

Create a new user with given attributes

## Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()
  , UserSchema = new mongoose.Schema()

UserSchema.plugin(troop.basicAuth)

var User = mongoose.model('user', UserSchema)

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


***

# <a name="Troop.timestamp" href="#Troop.timestamp">timestamp</a>

Adds a `created` and `modified` property to the schema, updating the timestamps as expected.

## Options

* `createdPath` schema path for created timestamp (optional, default `created`)
* `modifiedPath` schema path for modified timestamp (optional, default `modified`)
* `useVirtual` use a virtual path for created timestamp based on ObjectId (optional, default `true`)

## Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , FooSchema = new mongoose.Schema()

FooSchema.plugin(troop.timestamp)
````

## Note

Using the virtual `created` timestamp you will lose the ability to run queries against it, 
as well as a loss in precision, as it will return a timestamp in seconds.


***

# <a name="Troop.slugify" href="#Troop.slugify">slugify</a>

Turn a string based field into a url friendly slug

Converts `this is a title` to `this-is-a-title`

## Options

* `target` schema path for slug destination (optional, default `slug`)
* `source` schema path for slug content (optional, default `title`)
* `maxLength` maximum slug length (optional, default `50`)
* `spaceChar` space replacement character (optional, default `-`)
* `invalidChar` invalid character replacement (optional, default ``)
* `override` override slug field on source path change (optional, default `false`)

## Methods

### instance.slugify(string)

### model.slugify(string)

## Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , FooSchema = new mongoose.Schema()

FooSchema.plugin(troop.slugify)

var instance = new FooSchema({title: 'well hello there!'})

instance.save(function(err, doc) {
  console.log(doc.slug) // `well-hello-there`
})
````

## Note

This plugin does not currently support nested paths


***

# <a name="Troop.keywords" href="#Troop.keywords">keywords</a>

Keyword extraction/creation plugin, can be used as a simple substitute of a full
search indexing package.

Turns `fooed bars` into `['foo', 'bar']`

## Options

* `target` schema path for keyword destination (optional, default `keywords`)
* `source` schema path for extracting keywords, can be an array to specify multiple paths
* `minLength` minimum string length to be used as a keyword (optional, default `2`)
* `invalidChar` replacement char for invalid chars (optional, default ``)
* `naturalize` specifies whether to use a porter stemmer for keywords (optional, default `false`)

## Methods

### instance.extractKeywords(str)

### model.extractKeywords(str)

Manually calculate a keyword array with a given string

## Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()

var FooSchema = new mongoose.Schema({
  text: String
})

FooSchema.plugin(troop.keywords, {
  source: 'text'
})

var fooModel = mongoose.model('foo', FooSchema)
  , instance = new FooSchema({text: 'i am the batman'})

console.log(instance.keywords) // `['am', 'the', 'batman']`

var val = 'batman'

fooModel.find({ keywords: { $in: fooModel.extractKeywords(val) }}, function(docs) {
  // ...
})
````

## Note

This plugin does not currently support nested paths


***

# <a name="Troop.publish" href="#Troop.publish">publish</a>

Plugin to publish/subscribe from a model or instance level, also enabling a model 
to automatically publish changes on `init`, `save`, and `remove` methods.  Both models 
and instances can be published/subscribed to.

## Options

* `auto` attach middleware based on the `hook` for `init`, `save`, and `remove` methods (optional, default `false`)
* `hook` middleware method to attach auto middleware to (optional, default `post`)
* `seperator` redis channel seperator (optional, default `:`)
* `prefix` redis channel prefix, can be a string or function (optional, default ``)
* `channel` channel for schema to publish/subscribe to, can be a string or function (optional, default `schema.constructor.modelName`)
* `publish` redis instance to be used for publishing
* `subscribe` redis instance to be used for subscribing

## Methods

### instance.publish(doc, options, callback)

### instance.subscribe(callback)

### instance.unsubscribe(callback)

### instance.getChannel()

### instance.on(event, callback)

### model.subscribe(callback)

### model.unsubscribe(callback)

### model.getChannel()

### model.on(event, callback)

## Example

```javascript
var redis = require('redis')
  , publish = redis.createClient()
  , subscribe = redis.createClient()
  , mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()

var FooSchema = new mongoose.Schema({
  name: String
})

FooSchema.plugin(troop.publish, {
  publish: redis
, subscribe: subscribe
})

var FooModel = mongoose.model('foo', FooSchema)

FooModel.subscribe() // channel: 'foos'

FooModel.findOne({name: 'bar'}, function(err, instance) {
  // ...
})
````

Once you have a mongoose instance you can now publish it, by default, a model or 
instance will publish to it's own channel

```javascript
instance.publish(null, {
  method: 'save'
}, function(err, count) {
  // publishes to 'foos:4d6e5acebcd1b3fac9000007'
})
````

You can also publish other documents to other models or instances

```javascript
FooModel.publish(instance, function(err, count) {
  // publishes to 'foos'
})
````

or, if you have enabled `hooks`

```javascript
instance.save()
````

You can also subscribe on the instance level

```javascript
instance.subscribe() // channel: 'foos:4d6e5acebcd1b3fac9000007'
````


***

# <a name="Troop.pagination" href="#Troop.pagination">pagination</a>

Simple query pagination routines.

## Options

* `defaultQuery` Query to use if not specified (optional, default `{}`)
* `defaultLimit` Results per page to use if not specified (optional, default `10`)
* `defaultFields` Fields to use if not specified (optional, default `[]`)
* `remember` Remember the last options used for `query`, `limit`, and `fields` (optional, default `false`)

## Methods

### model.paginate(options, callback)

### model.firstPage(options, callback)

### model.lastPage(options, callback)

## Example

Assume that we have a collection with 55 records in it for the following example,
where the `count` field is incremented by 1 for each record, starting at 1.

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()

var FooSchema = new mongoose.Schema({
  name: String
, count: Number
})

FooSchema.plugin(troop.pagination)

var FooModel = mongoose.model('foo', FooSchema)

FooModel.paginate({ page: 1 }, function (err, docs, count, pages, current) {

  // docs.length = 10
  // count = 55
  // pages = 6
  // current = 1

})
````

Which, since using the default options, can also be written as:

```javascript
FooModel.firstPage(function (err, docs, count, pages, current) {
  // ...
})
````

Or, if you wanted the last page:

```javascript
FooModel.lastPage(function (err, docs, count, pages, current) {
  // docs.length = 5
  // current = 6
})
````

A more verbose pagination call

```javascript
FooModel.paginate({
  page: 2
, query: { count: { $gt: 25 } }
, limit: 25
, fields: ['name']
}, function(err, docs, count, pages, current) {
  
  // docs.length = 5
  // count = 30
  // pages = 2
  // current = 2

})
````

## Note

If using the `remember` option, the plugin will cache all of the options you give it 
each time you pass them in (except for the page), this can be handy if the params are 
going to be the same each time, if they are different you should not use this option.

Also, when on the last page, the plugin will return the trailing number of documents, 
in the example above the `lastPage` method returned 5 documents, it will never return 
a full set specified by the `limit` when this is the case.


***

# <a name="Troop.rest" href="#Troop.rest">rest</a>

## Options

* `pagination` options to send to the pagination plugin above (optional, see plugin defaults above)

Create a REST-ful controller for your models for use with flatiron/director, express, dnode or socket.io


***

# <a name="Troop.obfuscate" href="#Troop.obfuscate">obfuscate</a>

ObjectID encrypt/decryption. Recursively traverses a document, encrypting or decrypting 
any ObjectID that is found to prevent leaking any server information contained in the ID, will 
work with embedded documents as well as DBRefs.

## Options

* `encryptPath` Getter path for returning encrypted document (optional, default `obfuscate`)
* `decryptPath` Setter path for decrypting an object and assigning it to the document (optional, default `deobfuscate`)
* `algorithm` Encryption algorithm to use (optional, default `aes-256-cbc`)
* `key` Encryption key to be used (optional, default `secret`)
* `from` Encoding of the field to be encrypted (optional, default `utf8`)
* `to` Encoding of the encrypted field (optional, default `hex`)

## Methods

###model.encrypt(string)

###model.decrypt(string)

###model.encode(object, boolean)

###instance.encrypt(string)

###instance.decrypt(string)

## Example

```javascript
var mongoose = require('mongoose')
  , troop = require('mongoose-troop')
  , db = mongoose.connect()

var BarSchema = new mongoose.Schema()
  , UserSchema = new mongoose.Schema()
  , SessionSchema = new mongoose.Schema()

// A complicated schema
var FooSchema = new mongoose.Schema({
  dbref: { type: ObjectId, ref: BarSchema }
, dbrefArray: [{ type: ObjectId, ref: BarSchema }]
, nested: {
    dbref: { type: ObjectId, ref: BarSchema }
  , dbrefArray: [{ type: ObjectId, ref: BarSchema }]
  , embedded: [FooSchema]
}
, embedded: [FooSchema]
, user: { 
    id: { type: Schema.ObjectId, ref: 'user' }
  , session: {
      sid: { type: Schema.ObjectId, ref: 'session' }
    }
  }
})

FooSchema.plugin(troop.obfuscate)

var FooModel = mongoose.model('foo', FooSchema)
  , BarModel = mongoose.model('bar', BarSchema)
  , UserModel = mongoose.model('user', UserSchema)
  , SessionSchema = mongoose.model('session', SessionSchema)

var bar = new BarModel()
  , user = new UserModel()
  , session = new SessionModel()

var foo = new FooModel({
  dbref: bar
, dbrefArray: [foo2, foo3]
, embeddedArray: [foo]
, nested: {
    dbref: foo
  , dbrefArray: [foo2, foo3]
  , nested: [foo]
}
, embedded: {
    id: user._id
  , session: { sid: session._id }
  }
})

var obfuscated = foo.obfuscate
````

Now we should have an obfuscated object like so

```json
{
  _id: '0edaf91b2b5fa8c06413cdbf9ebed72a90a2c5ae4fe9b837d24865bd92c56ab2'
, dbref: '0edaf91b2b5fa8c06413cdbf9ebed72a4735e5707b8423055431a1fe65adad6b'
, dbrefArray: [
    '0edaf91b2b5fa8c06413cdbf9ebed72a59ea2f1567c4ba640c02b02bb73f36d7'
  , '0edaf91b2b5fa8c06413cdbf9ebed72aec369726048f7aa6cae9e8d20d7b2344'
  ]
, embedded: {
    id: '0edaf91b2b5fa8c06413cdbf9ebed72a340f055306b64aeececd8835755008fc'
  , session: {
      sid: '0edaf91b2b5fa8c06413cdbf9ebed72a9f324d66d3a0e0d1c2fdd12d65efa3ea'
    }
  }
, embeddedArray: [{
    _id: '0edaf91b2b5fa8c06413cdbf9ebed72a4735e5707b8423055431a1fe65adad6b'
  }]
, nested: {
    dbref: '0edaf91b2b5fa8c06413cdbf9ebed72a4735e5707b8423055431a1fe65adad6b'
  , dbrefArray: [
      '0edaf91b2b5fa8c06413cdbf9ebed72a59ea2f1567c4ba640c02b02bb73f36d7'
    , '0edaf91b2b5fa8c06413cdbf9ebed72aec369726048f7aa6cae9e8d20d7b2344'
    ]
  , embeddedArray: [{
      _id: '0edaf91b2b5fa8c06413cdbf9ebed72a4735e5707b8423055431a1fe65adad6b'
    }]
  }
}
````

To deobfuscate the object, we can assign it back to the original model, or to another.

```javascript
var emptyFoo = new FooModel()

emptyFoo.deobfuscate = obfuscated
````

Which should give us back the original object

```json
{ 
  _id: 4f1b234afe789543a3000008
, dbref: 4f1b234afe789543a3000003
, dbrefArray: [ 4f1b234afe789543a3000004, 4f1b234afe789543a3000005 ] 
, embedded: { 
    id: 4f1b234afe789543a3000007
  , session: { 
      sid: 4f1b234afe789543a3000006 
    }
  }
, embeddedArray:  [{
    _id: 4f1b234afe789543a3000003
  }]
, nested: { 
    dbref: 4f1b234afe789543a3000003
  , dbrefArray: [ 4f1b234afe789543a3000004, 4f1b234afe789543a3000005 ] 
  , embeddedArray: [{
      _id: 4f1b234afe789543a3000003
    }]
  }
}
````

## Note

This plugin will not work with `Mixed` type schema paths, you will have to obfuscate
those manually


***

# <a name="Troop.merge" href="#Troop.merge">merge</a>

Merge JSON into your object more easily.

```javascript
instance.merge({title:'A new title', description:'A new description'}).save()
````

## Note

This plugin does not currently support nested paths


***

# <a name="Troop.getdbrefs" href="#Troop.getdbrefs">getdbrefs</a>

Get the dbrefs from a schema

```javascript
instance.getdbrefs(function (refs) {
  // ...
})

```

## Note

This plugin does not currently support nested paths


***

# <a name="Troop.removeDefaults" href="#Troop.removeDefaults">removeDefaults</a>

Remove all of the default values from your model instance.

`instance.removeDefaults().save()`


## Note

This plugin does not currently support nested paths


***

## Contributing

This project is a work in progress and subject to API changes, please feel free to contribute


## License

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
