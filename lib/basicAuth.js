
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

var bcrypt = require('bcrypt')

function auth (schema, options) {
  options || (options = {})

  var loginPath = options.loginPath || 'username'
    , hashPath = options.hashPath || 'hash'
    , workFactor = options.workFactor || 10
    , query = {}
    , fields = {}

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

  schema.method('authenticate', function (password, next) {
    if (!password || !this[hashPath]) {
      return next('missing parameters')
    }
    bcrypt.compare(password, this[hashPath], next)
  })

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
  })

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
  })

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
  })

  schema
    .virtual('password')
    .get(function () {
      return this[hashPath]
    })
    .set(function (password) {
      this._password = password
    })

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
