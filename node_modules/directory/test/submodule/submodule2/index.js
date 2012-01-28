
console.log('submodule2')

require('directory')(function (module, filename) {
  this[filename] = module
})

