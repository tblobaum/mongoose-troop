
/*!
 * Copyright(c) Beau Sorensen
 * Contributors: Jacob Chapel
 * MIT Licensed
 */

var crypto = require('crypto')
  , nestedPath = require('../helpers').nestedPath

function obfuscate (schema, options) {
  options || (options = {})

  var encryptPath = options.encryptPath || 'obfuscate'    // Getter path for encrypting
    , decryptPath = options.decryptPath || 'deobfuscate'  // Setter path for decrypting
    , algorithm = options.algorithm || 'aes-256-cbc'      // Encryption algorithm
    , key = options.key || 'secret'                       // Encryption key
    , from = options.from || 'utf8'                       // Original encoding
    , to = options.to || 'hex'                            // Conversion encoding

  function encrypt (str) {
    var cipher = crypto.createCipher(algorithm, key)
      , crypted = cipher.update(str, from, to) + cipher.final(to)
    return crypted;
  }

  function decrypt (str) {
    var decipher = crypto.createDecipher(algorithm, key)
      , dec = decipher.update(str, to, from) + decipher.final(from)
    return dec;
  }

  function encode (schema, doc, toEncrypt) {
    if (!doc) return false
    var method = (toEncrypt) ? encrypt : decrypt
      , obj = (doc.toObject) ? doc.toObject() : doc

    // Traverse through all schema paths
    // for (var name in schema.paths) {
    schema.eachPath(function (name, path) {
      var val = nestedPath(doc, name)

      // ObjectID paths
      if (path.instance === 'ObjectID' && val) {
        nestedPath(obj, name, method(val.toString()))
      }

      if (path.casterConstructor) {
        // Array of DBRefs
        if (!!~path.casterConstructor.toString().indexOf('ObjectId')) {
          nestedPath(obj, name).forEach(function (v, k) {
            nestedPath(obj, name)[k] = method(val[k].toString())
          })     
        // Array of embedded schemas
        } else if (!!~path.casterConstructor.toString().indexOf('EmbeddedDocument')) {
          nestedPath(obj, name).forEach(function (v, k) {
            nestedPath(obj, name)[k] = encode(path.schema, val[k], toEncrypt)
          })
        }
      }
    })
    return obj
  }

  ;['method'
  , 'static'
  ].forEach(function(method) {
    schema[method]({
      encrypt: encrypt
    , decrypt: decrypt
    })
  })

  schema.static('encode', function (obj, toEncrypt) {
    if (!obj) return false
    return encode(schema, obj, toEncrypt)
  })

  schema.virtual(encryptPath).get(function () {
    return encode(schema, this, true)
  })

  schema.virtual(decryptPath).set(function (v) { 
    var doc = encode(schema, v, false)
    for (var prop in doc) {
      this[prop] = doc[prop]
    }
  })
}

module.exports = obfuscate
