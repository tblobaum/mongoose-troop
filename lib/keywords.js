
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */

module.exports = function(schema, options) {
  options || (options = {})

  var target = (options.target || 'keywords')
    , source = options.source
    , minLength = (options.minLength || 2)
    , fields = {}

  if (!schema.paths[target]) {
    fields[target] = [String]
    schema.add(fields)
  }

  schema
    .pre('save', function(next) {
      var words = []
      if (!(source instanceof Array)) source = [source]
      for (var i = 0; i < source.length; i++) {
        var add = this.extractKeywords(this[source[i]])
        for (var s = 0; s < add.length; s++) {
          if (!~words.indexOf(add[s])) words.push(add[s])
        }
      }
      this[target] = words
      next()
    })
  
  schema
    .method('extractKeywords', function (str) {
      if (!str) return []
      return str
        .toLowerCase()
        .split(/\s+/)
        .filter(function(v) { return v.length > minLength })
        .filter(function(v, i, a) { return a.lastIndexOf(v) === i })
    })
}
