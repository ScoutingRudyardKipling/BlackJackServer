"use strict";

let mongoose = require('../lib/mongoose');
let Schema = mongoose.Schema;
let autoIncrement = require('mongoose-auto-increment');

let rewardSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    reward: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
});

/**
 * Return all users
 * @param filter
 * @param callback
 */
rewardSchema.statics.findAll = function (filter, callback) {
    return this.find(filter, callback);
};

/**
 * Return the user with that id
 * @param id
 * @param callback
 */
rewardSchema.statics.findByID = function (id, callback) {
    return this.find({_id: id}, callback);
};

/**
 * Return the user with that code
 * @param code
 * @param callback
 */
rewardSchema.statics.findByCode = function (code, callback) {
    return this.find({code: code}, callback);
};

/**
 * Check whether the name is in distinct
 * @param code
 * @param callback
 */
rewardSchema.statics.codeIsUnique = function (code, callback) {
    Reward.findByCode(code, function (error, rewards) {
        if (error) {
            callback(error, false);
        } else if (rewards.length === 0) {
            callback(null, true);
        } else {
            callback({
                message: 'code is duplicate'
            }, false);
        }
    });
};

/**
 *
 * @param code
 * @returns {Promise<any>}
 */
rewardSchema.statics.promiseCodeIsUnique = function (code) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.codeIsUnique(code, function (error, success) {
            if (!success) {
                reject();
            } else {
                resolve();
            }
        })
    });
};

/**
 * Get all public information of the user
 * @returns {{name: *, type: *, _id: *}}
 */
rewardSchema.methods.getAllData = function () {
    return {
        _id: this._id,
        code: this.code,
        reward: this.reward,
        type: this.type
    };
};

// apply auto-increment
rewardSchema.plugin(autoIncrement.plugin, 'Reward');

// register model
let Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;