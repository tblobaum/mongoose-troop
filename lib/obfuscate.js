
/*!
 * Copyright(c) Beau Sorensen
 * Contributors: Jacob Chapel
 * MIT Licensed
 */

var crypto = require('crypto')

function nested (obj, key, val) {
  if (!obj) return obj
  var keys = key.split('.')
  if (keys.length > 1) {
    key = keys[0]
    keys.shift()
    return nested(obj[key], keys.join('.'), val)
  }
  val && (obj[key] = val)
  return obj[key]
}

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
    for (var name in schema.paths) {
      !!~name.indexOf('complex') && console.log('Path: ', name, schema.paths[name])

      var val = nested(doc, name)

      // ObjectID paths
      if (schema.paths[name].instance === 'ObjectID' && val) {
        nested(obj, name, method(val.toString()))
      }

      if (schema.paths[name].casterConstructor) {
        // Array of DBRefs
        if (!!~schema.paths[name]
          .casterConstructor
          .toString()
          .indexOf('ObjectId')) {
          for (var x = 0; x < nested(obj, name).length; x++) {
            nested(obj, name)[x] = method(val[x].toString())
          }          
        // Array of embedded schemas
        } else if (!!~schema.paths[name]
          .casterConstructor
          .toString()
          .indexOf('EmbeddedDocument')) {
          for (var x = 0; x < nested(obj, name).length; x++) {
            nested(obj, name)[x] = encode(schema.paths[name].schema, val[x], toEncrypt)
          }
        } else if (!!~schema.paths[name]
          .casterConstructor
          .toString()
          .indexOf('Mixed')) {
        }
      }
    }
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
    for (var k in doc) {
      this[k] = doc[k]
    }
  })
}

module.exports = obfuscate
