
console.log('submodule3')

require('directory')(function (module, filename) {
  this[filename] = module
})

