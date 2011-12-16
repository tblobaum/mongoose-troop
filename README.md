Example
-------

```javascript

var Troop = require('mongoose-troop')
    , Mongoose = require('mongoose')

var User = new mongoose.schema({ 
    name: String, 
    phone: String
})

User.plugin(Troop.authenticate)
User.plugin(Troop.timestamp)
User.plugin(Troop.addTags)
User.plugin(Troop.publishOnSave)
User.plugin(Troop.rest)

Mongoose.plugin(Troop.removeDefaults)
Mongoose.plugin(Troop.upsert)
Mongoose.plugin(Troop.merge)
Mongoose.plugin(Troop.filter)

Mongoose.model('User', User)

````


authenticate (alias basicAuth)
============
documentation needed.
example needed.

removeDefaults (alias clean)
==============
Remove all of the default values from your model instance.

`instance.removeDefaults().save()`

upsert (alias update)
======
A more intuitive upsert method for modifying your document without first retrieving it.

```javascript

var doc = { 
    _id: '4e6121...',
    name: 'Your Name',
    email: 'email@gmail.com',
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

timestamp (alias addCreatedAndModified)
=========
Adds a `modified` property to your schema, and uses the ObjectId to add a virtual `created` property.
example needed.

addTags (alias keywords, addKeywords)
========
documentation needed.
example needed.

merge
=====
Merge JSON into your object more easily.

```javascript

instance.merge({title:'A new title', description:'A new description'}).save()

````

publishOnSave
=============
Pass in a redis publisher connection to publish a model to redis everytime it is saved. Can intuitively publish only dirty/new data. Will eventually work with zeromq.

You can also explicitly publish a model instance.

```javascript

mongoose.plugin(troop.publishOnSave, {redis:redis})
instance.publish()

````

filter
======
Filter out properties which are not in your schema. The filter plugin will become obsolete in Mongoose v3.x

```javascript

instance.filter().save()

````

rest
====
Create a RESTful controller for your models for use with flatiron/director, express, dnode or socket.io
