
/*!
 * Analyticker - Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

module.exports = function (models) {
  require('directory')(function (module, filename) {
    models.plugin(module, options)
  })
}

