"use strict";

let mongoose = require('../lib/mongoose');
let Schema = mongoose.Schema;
let autoIncrement = require('mongoose-auto-increment');

let productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    costs: {
        type: Number,
        required: true
    },
    reward: {
        type: Number,
        required: true
    },
});

/**
 * Return all users
 * @param filter
 * @param callback
 */
productSchema.statics.findAll = function (filter, callback) {
    return this.find(filter, callback);
};

/**
 * Return the user with that id
 * @param id
 * @param callback
 */
productSchema.statics.findByID = function (id, callback) {
    return this.find({ _id: id }, callback);
};

/**
 * Return the user with that code
 * @param code
 * @param callback
 */
productSchema.statics.findByCode = function (code, callback) {
    return this.find({ code: code }, callback);
};

/**
 * Check whether the name is in distinct
 * @param code
 * @param callback
 */
productSchema.statics.codeIsUnique = function (code, callback) {
    Product.findByCode(code, function (error, products) {
        if (error) {
            callback(error, false);
        } else if (products.length == 0) {
            callback(null, true);
        } else {
            callback({
                message: 'code is duplicate'
            }, false);
        }
    });
};

/**
 * Get all public information of the user
 * @returns {{name: *, type: *, _id: *}}
 */
productSchema.methods.getAllData = function () {
    return {
        _id: this._id,
        name: this.name,
        code : this.code,
        image: this.image,
        costs: this.costs,
        reward: this.reward
    };
};

// apply auto-increment
productSchema.plugin(autoIncrement.plugin, 'Product');

// register model
let Product = mongoose.model('Product', productSchema);

module.exports = Product;