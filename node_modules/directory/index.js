
/*!
 * node-directory
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

var path = require('path')
  , fs = require('fs')

function modulate (dirname, callback) {

  if (!callback) 
    callback = dirname
  
  if (typeof dirname == 'function') 
    dirname = module.parent.paths[0].split("node_modules")[0]

  console.log('requiring directory ... ', dirname)
  
  var paths = fs.readdirSync(dirname)
  for (var l = paths.length, a=0; a < l; a++) {
    var path = dirname + paths[a]
    if (!path.match(module.parent.id) || module.parent.id === '.') {  
      var filename = path.split(dirname)[1].split(".js")[0]
      //var filename = path.split(".js")[0]
      console.log(' * ... ', filename)
      callback(require(path), filename)
    }
  }

}

delete require.cache[__filename]
module.exports = modulate

