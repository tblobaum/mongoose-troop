
/*!
 * node-directory
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

module.exports = function modulate(dirname, callback) {

  if (!callback) {
    var callback = dirname
  }
  
  if (typeof dirname == 'function') {
    var dirname = module.parent.paths[0].split("node_modules")[0]
  }

  
  var paths = require('findit').sync(dirname)
  
  paths.forEach(function (path) {
    if (!path.match(module.parent.id)) {  
      var filename = path.split(dirname)[1].split(".js")[0]
      callback(require(path), filename)
    }
  })
  
  delete require.cache[__filename]
}

