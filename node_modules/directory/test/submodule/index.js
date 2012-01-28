
console.log('submodule')

require('directory')(function (module, filename) {
  this[filename] = module
})

