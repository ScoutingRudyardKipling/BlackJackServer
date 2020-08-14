"use strict";

var mongoose = require('mongoose');
var assert = require('assert');

var url = 'mongodb://';
if(process.env.DB_USER !== undefined && process.env.DB_PASSWORD !== undefined) {
    url += process.env.DB_USER + ':' + encodeURIComponent(process.env.DB_PASSWORD) + '@';
}
url += process.env.DB_HOST + '/' + process.env.DB_DATABASE;
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect(url, function (err) {
    assert.equal(null, err);
    console.log('Connection to database established');
}).catch(reason => {
    console.warn(reason);
});
autoIncrement.initialize(mongoose);

module.exports = mongoose;
