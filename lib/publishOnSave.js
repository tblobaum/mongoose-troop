
/*!
 * Analytics Machine - Models - Mongoose Plugins
 * Copyright(c) Thomas Blobaum
 * MIT Licensed
 */

function mongoosePublishOnSave (schema, options) {
  options = options || {}
  
  schema.pre('save', function (next) {
    this.publish()
    next()
  })
  
  schema.method('publish', function () {
    var Publish = options.redis

    if (this._id && this._owner) {
      if (options.debug) {
        console.log('publishing to owner of', 
          this.constructor.modelName + String(this._owner), 
          this.constructor.modelName)
      }
      if (options.debug) {
        console.log('publishing', String(this._owner)+'::'+this.constructor.modelName)
      }
      // schemas are published with property '_owner'
      Publish.publish(
        String(this._owner)+'::'+this.constructor.modelName, 
        JSON.stringify(this)
      )
    }
    if (this._id) {
      if (options.debug) {
        console.log('publishing', String(this._id))
      }
      // schemas are published based on '_id'
      Publish.publish(String(this._id), JSON.stringify(this))
      return this
    } else {
      if (options.debug) {
        console.log('not publishing', this.constructor.modelName)
      }
      return this
    }
  })
  
}

module.exports = mongoosePublishOnSave

