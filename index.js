// Bootstrapping the main module with esm
require = require('esm')(module);
module.exports = require('./main');
