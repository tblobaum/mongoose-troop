
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

module.exports = function(schema, options) {
  options || (options = {})

  var createdPath = (options.createdPath || 'created')
    , modifiedPath = (options.modifiedPath || 'modified')
    , fields = {}

  fields[createdPath] = { type: Date, default: Date.now }
  fields[modifiedPath] = { type: Date }

  schema.add(fields)

  schema.pre('save', function (next) {
    this[modifiedPath] = new Date
    next()
  })
}
