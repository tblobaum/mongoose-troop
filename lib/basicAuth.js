
//  (c) 2012 Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// basicAuth
// ---------

// Dependencies
var bcrypt = require('bcrypt')

// Plugin
function auth (schema, options) {
  options || (options = {})

  // Options
  var loginPath = options.loginPath || 'username'
    , hashPath = options.hashPath || 'hash'
    , workFactor = options.workFactor || 10
    , query = {}
    , fields = {}

  // Add paths to schema if not present
  if (!schema.paths[loginPath]) {
    fields[loginPath] = {
      type: String
    , lowercase: true
    , required: true
    , index: { unique: true } 
    }
  }
  if (!schema.paths[hashPath]) {
    fields[hashPath] = { type: String }
  }
  schema.add(fields)

  // Main authentication method, compare the given password 
  // against the current instances stored hash
  schema.method('authenticate', function (password, next) {
    if (!password || !this[hashPath]) {
      return next('missing parameters')
    }
    bcrypt.compare(password, this[hashPath], next)
    return this
  })

  // Set and encrypt the password of the current model
  schema.method('setPassword', function (password, next) {
    var self = this
    bcrypt.genSalt(workFactor, function (err, salt) {
      if (err) return next(err)
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return next(err)
        self[hashPath] = hash
        next(null)
      })
    })
    return this
  })

  // Authenticate with the configured login path and password on 
  // the model layer, passing the authenticated instance into the callback
  schema.static('authenticate', function (username, password, next) {
    query[loginPath] = username

    this.findOne(query, function (err, model) {
      if (err) return next(err)
      if (!model) return next('model does not exist')

      model.authenticate(password, function (err, valid) {
        if (err) return next(err)
        if (valid) return next(null, model)
        return next('invalid password', null)
      })
    })
    return this
  })

  // Register a new user instance with the supplied attributes, passing
  // the new instance into the callback if no errors were found
  schema.static('register', function (attr, next) {
    this.create(attr, function (err, model) {
      if (err) {
        if (/duplicate key/.test(err)) {
          return next(loginPath + ' taken')
        }
        return next(err)
      }
      return next(null, model)
    })
    return this
  })

  // Create a virtual path for the password path, storing a temporary
  // unencrypted password that will not be persisted, and returning the 
  // encrypted hash upon request
  schema
    .virtual('password')
    .get(function () {
      return this[hashPath]
    })
    .set(function (password) {
      this._password = password
    })

  // Create a hash of the password if one has not already been made, this
  // should only be called the first time a password is set, the `setPassword`
  // method will need to be used after it has been created
  schema.pre('save', function (next) {
    if (this._password && !this[hashPath]) {
      this.setPassword(this._password, function () {
        next()
      })
    } else {
      next()
    }
  })
}

module.exports = auth
