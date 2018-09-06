var config = require('../config/default');

// load environment specific configuration
console.log('Starting server with default configuration.');

// make sure environment variables are committed
if (config.env && typeof config.env === 'object') {
    for (var index in config.env) {
        process.env[index] = config.env[index];
    }
}

module.exports = config;