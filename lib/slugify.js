
//  (c) 2012 Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Slugify
// -------

// Plugin
function slugify (schema, options) {
  options || (options = {})

  // Options
  var target = options.target || 'slug'       // Slug destination
    , source = options.source || 'title'      // Slug content field
    , maxLength = options.maxLength || 50     // Max slug length
    , spaceChar = options.spaceChar || '-'    // Space replacement
    , invalidChar = options.invalidChar || '' // Invalid char replacement
    , override = options.override || false    // Override slug on set
    , fr = 'àáâãäåçèéêëìíîïñðóòôõöøùúûüýÿ'    // Accent chars to find
    , to = 'aaaaaaceeeeiiiinooooooouuuuyy'    // Accent replacement
    , fields = {}
  
  // Add paths to schema if not present
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
  
  // Add slugify method to both model and instance
  ;['static'
  , 'method'
  ].forEach(function (method) {
    schema[method]('slugify', function (str) {
      if (!str) return
      str = str
        .replace(/^\s+|\s+$/g, '')
        .toLowerCase()
      
      // Convert all accent characters
      for (var i=0; i<fr.length; i++) {
        str = str.replace(new RegExp(fr.charAt(i), 'g'), to.charAt(i))
      }

      // Replace all invalid characters and spaces, truncating to the max length
      return str
        .replace(/[^a-z0-9 -]/g, invalidChar)
        .replace(new RegExp('['+invalidChar+']'+'+', 'g'), invalidChar)
        .replace(/\s+/g, spaceChar)
        .substr(0, maxLength)
    })
  })
  
  // Extract the slug on save, optionally overriding a previous value
  schema.pre('save', function (next) {
    if (!this[target] || override) {
      this[target] = this.slugify(this[source])
    }
    next()
  })
}

module.exports = slugify

