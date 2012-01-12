
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

module.exports = function(schema, options) {
  options || (options = {})

  var createdPath = (options.createdPath || 'created')
    , modifiedPath = (options.modifiedPath || 'modified')
    , useVirtual = (options.useVirtual || true)
    , fields = {}

  fields[createdPath] = { type: Date, default: Date.now }
  !useVirtual && fields[modifiedPath] = { type: Date }

  schema.add(fields)

  useVirtual && schema
    .virtual(createdPath)
    .get(function() {
      return new Date(this._id.generationTime * 1000)
    })

  schema.pre('save', function (next) {
    this[modifiedPath] = new Date
    next()
  })
}
