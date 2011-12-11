
/*!
 * Analytics Machine - Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

require('directory')(__dirname + '/lib/', function (fn, filename) {
  module.exports[filename] = fn
})
