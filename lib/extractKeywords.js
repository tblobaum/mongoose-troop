
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

module.exports = function(schema, options) {
  options || (options = {})

  var target = options.target
    , source = options.source

  schema
    .pre('save', function(next) {
      var words = []

      if (!(source instanceof Array)) source = [source]

      for (var i = 0; i < source.length; i++) {
        var add = this.extractKeywords(this[source[i]])
        for (var s = 0; s < add.length; s++) {
          if (!~words.indexOf(ext[s])) words.push(add[s])
        }
      }
      this[target] = words
      next()
    })
  
  schema.method('extractKeywords', function (str) {
    if (!str) return []
    return str
      .toLowerCase()
      .split(/\s+/)
      .filter(function(v) { return v.length > 2 })
      .filter(function(v, i, a) { return a.lastIndexOf(v) === i })
  })
}
