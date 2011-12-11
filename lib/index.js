
/*!
 * Analytics Machine - Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

require('directory')(function (fn, filename) {
  module.exports[filename] = fn
})
