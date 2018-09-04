"use strict";

let mongoose = require('../lib/mongoose');
let Schema = mongoose.Schema;
let autoIncrement = require('mongoose-auto-increment');
let encryption = require('../lib/encryption');
const tokenLength = 50;

let groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'name too short'],
        maxlength: [40, 'name too long']
    },
    group: {
        type: String,
        required: true
    },
    password: String,
    type: {
        type: String,
        enum: ['participant', 'administrator'],
        required: true,
        default: 'participant'
    },
    tokens: [{
        token: String,
        date: Date
    }],
    products: [{
        _id: {
            type: Number,
            required: true
        },
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
        bought: {
            type: Boolean,
            default: false
        },
        rewarded: {
            type: Boolean,
            default: false
        },
    }],
    points: {
        type: Number,
        default: 0
    },
    credits: {
        type: Number,
        default: 0
    },
    rewards: [{
        _id: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }]
});

/**
 * Return all users
 * @param filter
 * @param callback
 */
groupSchema.statics.findAll = function (filter, callback) {
    return this.find(filter, callback);
};

/**
 * Return the user with that id
 * @param id
 * @param callback
 */
groupSchema.statics.findByID = function (id, callback) {
    return this.find({ _id: id }, callback);
};


/**
 * Return the first user which has the given name
 * @param name
 * @param callback
 * @returns {Query|*|FindOperatorsUnordered|FindOperatorsOrdered|Cursor|T}
 */
groupSchema.statics.findByName = function (name, callback) {
    return this.find({ name: name }, callback);
};

/**
 * Check whether the name is in distinct
 * @param name
 * @param callback
 */
groupSchema.statics.nameIsUnique = function (name, callback) {
    Group.findByName(name, function (error, users) {
        if (error) {
            callback(error, false);
        } else if (users.length == 0) {
            callback(null, true);
        } else {
            callback({
                message: 'name is duplicate'
            }, false);
        }
    });
};

/**
 *
 * @param name
 * @returns {Promise}
 */
groupSchema.statics.promiseNameIsUnique = function (name) {
    return new Promise(function (resolve, reject) {
        Group.nameIsUnique(name, function (error, success) {
            if (success === true) {
                resolve();
            } else {
                reject(error);
            }
        });
    });
};

/**
 * Update a user's password
 * @param password
 * @param callback
 */
groupSchema.methods.setPassword = function (password, callback) {
    encryption.hash(password, function (err, hash) {
        this.password = (!err) ? hash : '';
        callback(err);
    }.bind(this));
};

/**
 *
 * @param password
 * @returns {Promise}
 */
groupSchema.methods.promiseSetPassword = function (password) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.setPassword(password, function (error) {
            if (!error) {
                resolve();
            } else {
                reject(error);
            }
        });
    });
};

/**
 * Password validation
 * @param password
 * @param successCallback
 * @param failureCallback
 */
groupSchema.methods.validPassword = function (password, successCallback, failureCallback) {
    encryption.validate(password, this.password, function (error, success) {

        if (success) {
            successCallback();
        } else {
            failureCallback();
        }

    });
};

/**
 * Token validation
 * @param token
 * @returns {boolean}
 */
groupSchema.methods.verifyToken = function (token) {
    // invalid token?
    if (token.length != tokenLength) {
        return false;
    }

    // check if the token exists for this user
    for (var index in this.tokens) {
        if (this.tokens[index].token == token) {
            return true;
        }
    }
    return false;
};

/**
 * Generate a new access token
 */
groupSchema.methods.generateToken = function () {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < tokenLength; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    // push token
    this.tokens.push({
        token: token,
        date: new Date()
    });

    return token;
};

/**
 *
 * @param token
 */
groupSchema.methods.updateTokenDate = function (token) {
    var toRemove = [];
    for (var index in this.tokens) {
        // update the date for the current token
        if (this.tokens[index].token == token) {
            this.tokens[index].date = new Date();
            continue;
        }

        // make sure a token will expire after thirty days of inactivity
        if (((new Date() - this.tokens[index].date) / (1000 * 60 * 60 * 24)) > 30) {
            this.tokens.splice(index, 1);
            index--;
        }
    }

    // save in background
    this.save();
};

/**
 * Add a product to a group
 * @param product Product
 */
groupSchema.methods.addProduct = function (product) {
    for(let prod of this.products) {
        if(prod._id === product._id) {
            return false;
        }
    }

    // push product
    this.products.push({
        _id: product._id,
        name: product.name,
        image: product.image,
        costs: product.costs,
        reward: product.reward,
        bought: false,
        rewarded: false
    });

    return true;
};

/**
 * Add a product to a group
 * @param reward Reward
 */
groupSchema.methods.addReward = function (reward) {
    for(let rew of this.rewards) {
        if(rew._id === reward._id) {
            return false;
        }
    }

    // push reward
    this.rewards.push({
        _id: reward._id,
        reward: reward.reward
    });

    return true;
};

/**
 * Get all public information of the user
 * @returns {{name: *, type: *, _id: *}}
 */
groupSchema.methods.getAllData = function () {
    return {
        _id: this._id,
        name: this.name,
        group: this.group,
        points: this.points,
        credits: this.credits,
        products: this.products,
        rewards: this.rewards
    };
};

/**
 * Get all public information of the user
 * @returns {{name: *, type: *, _id: *}}
 */
groupSchema.methods.getPublicData = function () {
    return {
        _id: this._id,
        name: this.name,
        group: this.group,
        points: this.points
    };
};

/**
 * Get all basic information of the user
 * @returns {{_id: *, name: *}}
 */
groupSchema.methods.getBasicData = function () {
    return {
        _id: this._id,
        name: this.name,
        group: this.group
    };
};

// apply auto-increment
groupSchema.plugin(autoIncrement.plugin, 'Group');

// register model
let Group = mongoose.model('Group', groupSchema);

module.exports = Group;