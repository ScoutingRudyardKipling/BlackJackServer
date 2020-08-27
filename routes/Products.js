"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Reward = require('../models/Reward');
const fcm = require('../lib/fcm');

class Products extends Base {

    /**
     * Authentication class
     * Dealing with group login and logouts
     * @param router
     */
    constructor(app) {
        super(app, router);

        // add routes to router
        this.resolve();
    };

    /**
     * Resolve routes
     */
    resolve() {
        // allow listing scanned products
        this.regRoute('get', '/', [], [], true).then(this.getProducts.bind(this));

        // allow scanning product
        this.regRoute('post', '/', ['code'], [], true).then(this.postProduct.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getProducts(request, input, response) {
        response.json({
            data: request.user.products
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @returns {*}
     */
    postProduct(request, input, response) {
        let self = this;
        input['code'] = input['code'].toUpperCase();
        Product.findByCode(input['code'], function (error, products) {
            if (error || products.length === 0) {
                self.postRewardProduct(request, input, response);
            } else {
                if (request.user.addProduct(products[0])) {
                    request.user.save().then(() => {
                        fcm.sendNewProduct(products[0], request.user);
                        response.json({
                            groupInfo: request.user.getAllData(),
                            productId: products[0]._id,
                            type: "product"
                        });
                    }).catch((e) => {
                        response.status(500).json({
                            success: false,
                            error: 'UNKNOWN_ERROR',
                            message: 'Er trad een onbekende fout op.'
                        })
                    });
                } else {
                    response.status(422).json({
                        success: false,
                        error: 'PRODUCT_ALREADY_SCANNED',
                        message: 'Paniek! Dit product zit al in je winkelwagen.'
                    });
                }
            }
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @returns {*}
     */
    postRewardProduct(request, input, response) {
        let self = this;
        Product.findByRewardCode(input['code'], function (error, products) {
            if (error || products.length === 0) {
                self.postReward(request, input, response);
            } else {
                // verify that product is scanned
                let product = self.getProductForUser(products[0], request.user);

                if (product.rewarded) {
                    response.status(422).json({
                        success: false,
                        error: 'PRODUCT_ALREADY_REWARDED',
                        message: 'Hee! Je hebt al punten gekregen voor dit product!'
                    });
                    return;
                }

                // check for bonus
                Product.findOne({
                    _id: product._id
                }, function (error, originalProduct) {
                    let bonus = false;
                    if (error || !originalProduct) {

                    } else {
                        if (originalProduct !== null && originalProduct !== undefined && originalProduct.bonus === true) {
                            bonus = true;
                        }
                    }

                    request.user.points += bonus ? 2 * product.reward : product.reward;
                    product.rewarded = true;
                    request.user.save().then(() => {
                        fcm.sendUpdateProduct(product, request.user);
                        fcm.sendUpdateGroupProperty("points", request.user.points, request.user);
                        if (bonus) {
                            response.json({
                                groupInfo: request.user.getAllData(),
                                message: "Nice, deze " + product.name + " was in de bonus, dus je krijgt de bonus van " + product.reward + " punten twee maal!! Lekker bezig pik!",
                                type: "product_reward"
                            });
                        } else {
                            response.json({
                                groupInfo: request.user.getAllData(),
                                message: "Nice, zojuist " + product.reward + " punten verdient voor deze " + product.name,
                                type: "product_reward"
                            });
                        }
                    }).catch(() => {
                        response.status(500).json({
                            success: false,
                            error: 'UNKNOWN_ERROR',
                            message: 'Er trad een onbekende fout op.'
                        })
                    });
                });
            }
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @returns {*}
     */
    postReward(request, input, response) {
        Reward.findByCode(input['code'], function (error, rewards) {
            if (error || rewards.length === 0) {
                response.status(404).json({
                    success: false,
                    error: 'CODE_UNKNOWN',
                    message: 'Helaas, deze code is ongeldig.'
                });
            } else {
                if (request.user.addReward(rewards[0])) {
                    var message = "";
                    if (rewards[0].type === 'point') {
                        request.user.points += rewards[0].reward;
                        message = "Yes! Je hebt er " + rewards[0].reward + " punten bij gekregen. Je hebt nu " + request.user.points + " punten.";
                    }
                    request.user.save().then(() => {
                        fcm.sendUpdateGroupProperty("points", request.user.points, request.user);
                        response.json({
                            groupInfo: request.user.getAllData(),
                            message: message,
                            type: "points"
                        });
                    }).catch(() => {
                        response.status(500).json({
                            success: false,
                            error: 'UNKNOWN_ERROR',
                            message: 'Er trad een onbekende fout op.'
                        })
                    });
                } else {
                    response.status(422).json({
                        success: false,
                        error: 'REWARD_ALREADY_SCANNED',
                        message: 'Paniek! Je hebt deze reward al ontvangen.'
                    });
                }
            }
        });
    }

    /**
     *
     * @param scannedProduct
     * @param user
     * @returns {null}
     */
    getProductForUser(scannedProduct, user) {
        user.addProduct(scannedProduct);
        let product = null;
        for (let prod of user.products) {
            if (prod._id === scannedProduct._id) {
                product = prod;
                break;
            }
        }

        return product;
    }
}

module.exports = Products;
