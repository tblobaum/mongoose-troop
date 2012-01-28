
//require('tap')


console.log('Testing node-directory...')

var directory = require('../')

directory(function (module, filename) {
  console.log(filename)
  this[filename] = module
})

