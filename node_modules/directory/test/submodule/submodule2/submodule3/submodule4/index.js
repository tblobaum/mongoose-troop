
console.log('submodule4')

require('directory')(function (module, filename) {
  this[filename] = module
})

