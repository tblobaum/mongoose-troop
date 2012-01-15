
var Mongoose = require('mongoose')

function mongooseToJSON (schema, options) {
  options = options || {};
  schema.method('toJSON2', function () {
    var getters = schema.virtuals.modelName.getters
    for (var key in getters) {
      var fn = getters[key]
      this._doc['virtual_'+key] === fn()
    }
    return this
  }) 
}

module.exports = mongooseToJSON

