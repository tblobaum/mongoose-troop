
/*!
 * Copyright(c) Beau Sorensen
 * Contributors: Jacob Chapel
 * MIT Licensed
 */

var crypto = require('crypto')

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

  function encode (schema, obj, toEncrypt) {
    var method = (toEncrypt) ? encrypt : decrypt

    schema.eachPath(function (name, path) {
      if (path.instance === 'ObjectID') {
        obj[name] = method(obj[name].toString())
      }
      if (path.casterConstructor) {
        if (!!~path.casterConstructor.toString().indexOf('function ObjectId')) {
          obj[name].forEach(function (val, k) {
            obj[name][k] = method(val.toString())
          })
        } else if (!!~path.casterConstructor.toString().indexOf('function EmbeddedDocument')) {
          obj[name].forEach(function (val, k) {
            obj[name][k] = encode(path.schema, val, toEncrypt)
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
    if (obj.toObject) obj = obj.toObject()
    return encode(schema, obj, toEncrypt)
  })

  schema.virtual(encryptPath).get(function () {
    return encode(schema, this.toObject(), true)
  })

  schema.virtual(decryptPath).set(function (v) { 
    var doc = encode(schema, v, false)
    for (var k in doc) {
      this[k] = doc[k]
    }
  })
}

module.exports = obfuscate
