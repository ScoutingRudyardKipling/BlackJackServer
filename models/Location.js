"use strict";

let mongoose = require('../lib/mongoose');
let Schema = mongoose.Schema;
let autoIncrement = require('mongoose-auto-increment');

let locationSchema = new Schema({
    groupId: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: [Number],
        default: [0, 0],
        required: true
    }
});

/**
 * Return all users
 * @param filter
 * @param callback
 */
locationSchema.statics.findAll = function (filter, callback) {
    return this.find(filter, callback);
};

// apply auto-increment
locationSchema.plugin(autoIncrement.plugin, 'Location');

// register model
let Location = mongoose.model('Location', locationSchema);

module.exports = Location;