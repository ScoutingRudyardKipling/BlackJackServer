"use strict";

const config = require('./config');
var mongoose = require('mongoose');
var assert = require('assert');

var url = 'mongodb://';
if(config.mongodb.name !== undefined && config.mongodb.password !== undefined) {
    url += config.mongodb.name + ':' + encodeURIComponent(config.mongodb.password) + '@';
}
url += config.mongodb.host + '/' + config.mongodb.database;
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect(url, function (err) {
    assert.equal(null, err);
    console.log('Connection to database established');
}).catch(reason => {
    console.warn(reason);
});
autoIncrement.initialize(mongoose);

module.exports = mongoose;