const config = require('./config');
var exports;

switch (config.encryption) {

    case 'none':
    default:

        exports = {
            hash: function (password, callback) {
                callback(null, password);
            },
            validate: function (password, hash, callback) {
                callback(null, password === hash);
            }
        };

        break;

}

module.exports = exports;