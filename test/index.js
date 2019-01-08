'use strict'

// replace require with the esm version of require for added functionality
require = require('esm')(module)


// normal export so node knows what your main file is
module.exports = require('./main.js')