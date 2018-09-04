var config = require('../config/default');

// load environment specific configuration
try {
    var envName = process.env.NODE_ENV;

    var overrides = {};
    if (envName) {
        overrides = require('../config/' + process.env.NODE_ENV);
    }

    console.log('Starting server as ' + envName);

    // perform override
    for (var index in overrides) {
        config[index] = overrides[index];
    }
} catch (e) {
    console.log('Failed loading configuration for ' + envName + ', starting with default configuration.');
}

// make sure environment variables are committed
if (config.env && typeof config.env === 'object') {
    for (var index in config.env) {
        process.env[index] = config.env[index];
    }
}

module.exports = config;