# node-directory
require all files and directories inside a directory

## Example
As an example, this may be your index.js file in a directory 

```javascript

require('directory')(function (module, name) {
  exports[name] = module
})

````

Or require a different directory

```javascript

require('directory')(__dirname + '/plugins/', function (module, name) {
  exports[name] = module
})

````

Installation
------------

    npm install directory

Usage
-----

require('directory')([dirname,] iterator)
-----------------------------------------

MIT License

