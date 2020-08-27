"use strict";

let mongoose = require('mongoose');
let assert = require('assert');
let autoIncrement = require('mongoose-auto-increment');

mongoose.connect('mongodb://' + process.env.DB_HOST + '/' + process.env.DB_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD
}, function (err) {
    assert.equal(null, err);
    console.log('Connection to database established');
});

mongoose.set('useCreateIndex', true);
autoIncrement.initialize(mongoose);

module.exports = mongoose;
