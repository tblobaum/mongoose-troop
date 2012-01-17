
/*!
 * Copyright(c) Beau Sorensen
 * MIT Licensed
 */
 
function slugify (schema, options) {
  options || (options = {})

  var target = options.target || 'slug'       // Slug destination
    , source = options.source || 'title'      // Slug content field
    , maxLength = options.maxLength || 50     // Max slug length
    , spaceChar = options.spaceChar || '-'    // Space replacement
    , invalidChar = options.invalidChar || '' // Invalid char replacement
    , override = options.override || false    // Override slug on set
    , fr = 'àáâãäåçèéêëìíîïñðóòôõöøùúûüýÿ'    // Accent chars to find
    , to = 'aaaaaaceeeeiiiinooooooouuuuyy'    // Accent replacement
    , fields = {}
  
  if (!schema.paths[target]) {
    fields[target] = {
      type: String 
    , unique: true
    , sparse: true
    }
  }
  if (!schema.paths[source]) {
    fields[source] = String
  }
  schema.add(fields)
  
  schema.method('slugify', function (str) {
    if (!str) return
    str = str
      .replace(/^\s+|\s+$/g, '')
      .toLowerCase()
    
    for (var i=0; i<fr.length; i++) {
      str = str.replace(new RegExp(fr.charAt(i), 'g'), to.charAt(i))
    }
    return str
      .replace(/[^a-z0-9 -]/g, invalidChar)
      .replace(new RegExp('['+invalidChar+']'+'+', 'g'), invalidChar)
      .replace(/\s+/g, spaceChar)
      .substr(0, maxLength)
  })
  
  schema.pre('save', function (next) {
    if (!this[target] || override) {
      this[target] = this.slugify(this[source])
    }
    next()
  })
}

module.exports = slugify

