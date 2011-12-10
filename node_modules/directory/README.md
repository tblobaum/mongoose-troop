node-directory
=========
A simple module to require all files and directories inside a directory.  By 
default it requires all files in the current directory except itself, and maps 
them to a callback.

Example
-------

As an example, this may be your index.js file in a directory that contains all 
of the schemas for your models. The call to directory will require all of the 
(other) files in the current directory and loop through them.

```javascript

module.exports = function (models, options) {
  options = options || { debug:false }

  require('directory')(function (module) {
    models.model(module.name, module, options)
  })

}

````

Require a different directory:

```javascript

require('directory')(__dirname + '/plugins', function (plugin) {
  models.plugin(plugin, options)
})

````

Installation
------------

    npm install directory --save

Usage
-----

require('directory')([dirname,] callback)
-----------------------------------------

MIT License

