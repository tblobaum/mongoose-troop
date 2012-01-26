
//  (c) 2012 Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Helpers
// -------

// Setter to ensure sparse fields are undefined if empty
function emptyToSparse (str) {
  return (!str || !str.length) 
    ? undefined 
    : str
}

// Validator to ensure that a property exists
function validatePresenceOf (value) {
  return value && value.length
}

// Create an object out of a nested path
function nestedPath (obj, path, val) {
  if (typeof obj !== 'object') {
    return obj
  }
  var keys = path.split('.')
  if (keys.length > 1) {
    path = keys.shift()
    return nestedPath(obj[path], keys.join('.'), val)
  }
  if (val !== undefined) {
    obj[path] = val
  }
  return obj[path]
}

// Convert a document or an array of documents to objects
function dataToObjects (data) {
  if (!data) return null
  if (data instanceof Array) {
    return data.map(function(doc) { 
      return doc.toObject()
    })
  }
  return data.toObject()
}

// Execute if function or return object
function objectOrFunction(obj) {
  if (toString.call(obj) == '[object Function]') {
    return obj()
  }
  return obj
}

// Destroy a database and disconnect
function dropDatabase (db, fn) {
  db.connection.db.executeDbCommand({
    dropDatabase: 1
  }, function(err, result) {
    db.disconnect()
    fn && fn(err, result)
  })
}

// Drop all collections in a database
function dropCollections (db, each, fn) {
  if (each && !fn) { fn = each; each = null }
  var conn = db.connection
    , cols = Object.keys(conn.collections)

  cols.forEach(function (name, k) {
    console.log('name: ', name, k)
    conn.collections[name].drop(function (err) {
      if (err == 'ns not found') {
        err = null
      }
      each && each(err, name)
    })
  })
  fn && fn(null)
}

// Exports
module.exports = {
  emptyToSparse: emptyToSparse
, validatePresenceOf: validatePresenceOf
, nestedPath: nestedPath
, dataToObjects: dataToObjects
, objectOrFunction: objectOrFunction
, dropDatabase: dropDatabase
, dropCollections: dropCollections
}
