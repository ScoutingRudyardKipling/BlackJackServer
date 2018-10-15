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

        // allow unlocking product
        this.regRoute('put', '/:productId', ['productId', 'action'], [], true).then(this.unlockProduct.bind(this));
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
        Product.findByCode(input['code'], function (error, products) {
            if (error || products.length === 0) {
                self.postRewardProduct(request, input, response);
            } else {
                if (request.user.addProduct(products[0])) {
                    request.user.save().then(() => {
                        fcm.sendNewProduct(products[0], request.user);
                        response.json({
                            success: true,
                            data: {
                                groupInfo: request.user.getAllData(),
                                productId: products[0]._id,
                                type: "product"
                            }
                        });
                    }).catch((e) => {
                        response.json({
                            success: false,
                            error: 'UNKNOWN_ERROR',
                            message: 'Er trad een onbekende fout op.'
                        })
                    });
                } else {
                    response.json({
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
                let product = null;
                let scanned = products[0];
                for (let prod of request.user.products) {
                    if (prod._id === scanned._id) {
                        product = prod;
                        break;
                    }
                }

                if (product === null) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_NOT_SCANNED',
                        message: 'Paniek! Je kan geen punten krijgen voor dit product als het niet in je winkelmandje zit!'
                    });
                    return;
                }

                if (!product.bought) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_NOT_UNLOCKED',
                        message: 'Paniek! Je kan geen punten krijgen voor dit product omdat je hem nog niet unlocked hebt.'
                    });
                    return;
                }

                if (product.rewarded) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_ALREADY_REWARDED',
                        message: 'Hee! Je hebt al punten gekregen voor dit product!'
                    });
                    return;
                }

                request.user.points += product.reward;
                product.rewarded = true;
                request.user.save().then(() => {
                    fcm.sendUpdateProduct(product, request.user);
                    fcm.sendUpdateGroupProperty("points", request.user.points, request.user);
                    response.json({
                        success: true,
                        data: {
                            groupInfo: request.user.getAllData(),
                            message: "Nice, zojuist " + product.reward + " punten verdient voor deze " + product.name,
                            type: "product_reward"
                        }
                    });
                }).catch(() => {
                    response.json({
                        success: false,
                        error: 'UNKNOWN_ERROR',
                        message: 'Er trad een onbekende fout op.'
                    })
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
                response.json({
                    success: false,
                    error: 'CODE_UNKNOWN',
                    message: 'Helaas, deze code is ongeldig.'
                });
            } else {
                if (request.user.addReward(rewards[0])) {
                    var message = "";
                    if (rewards[0].type === 'point') {
                        request.user.points += rewards[0].reward;
                        message = "Yes! Je hebt er " + rewards[0].reward + " punten bij gekregen. Je hebt nu " + request.user.points + " punten en " + request.user.credits + " actiepunten.";
                    } else if (rewards[0].type === 'actionpoint') {
                        request.user.credits += rewards[0].reward;
                        message = "Yes! Je hebt er " + rewards[0].reward + " actiepunten bij gekregen. Je hebt nu " + request.user.points + " punten en " + request.user.credits + " actiepunten.";
                    }
                    request.user.save().then(() => {
                        fcm.sendUpdateGroupProperty("points", request.user.points, request.user);
                        fcm.sendUpdateGroupProperty("credits", request.user.credits, request.user);
                        response.json({
                            success: true,
                            data: {
                                groupInfo: request.user.getAllData(),
                                message: message,
                                type: "points"
                            }
                        });
                    }).catch(() => {
                        response.json({
                            success: false,
                            error: 'UNKNOWN_ERROR',
                            message: 'Er trad een onbekende fout op.'
                        })
                    });
                } else {
                    response.json({
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
     * @param request
     * @param input
     * @param response
     */
    unlockProduct(request, input, response) {
        if (input.action !== 'unlock') {
            response.json({
                success: false,
                error: 'ACTION_UNKNOWN',
                message: 'Deze actie bestaat niet.'
            });
            return;
        }

        // verify that product is scanned
        let product = null;
        for (let prod of request.user.products) {
            if (prod._id === input.productId._id) {
                product = prod;
                break;
            }
        }

        if (product === null) {
            response.json({
                success: false,
                error: 'PRODUCT_NOT_SCANNED',
                message: 'Je kan het product niet unlocken als je het nog niet gescand hebt.'
            });
            return;
        }

        // verify that product is not already unlocked
        if (product.bought === true) {
            response.json({
                success: false,
                error: 'PRODUCT_ALREADY_UNLOCKED',
                message: 'Je hebt dit product al unlocked, je hoeft niks te doen.'
            });
            return;
        }

        // verify that group has enough credits
        if (request.user.credits < product.costs) {
            response.json({
                success: false,
                error: 'NOT_ENOUGH_CREDITS',
                message: 'Je hebt niet genoeg actiepunten om dit product te unlocken.'
            });
            return;
        }

        // unlock product
        product.bought = true;
        request.user.credits = request.user.credits - product.costs;
        request.user.save().then(() => {
            fcm.sendUpdateProduct(product, request.user);
            fcm.sendUpdateGroupProperty("credits", request.user.credits, request.user);
            response.json({
                success: true,
                data: request.user.getAllData()
            });
        }).catch(() => {
            response.json({
                success: false,
                error: 'UNKNOWN_ERROR',
                message: 'Er trad een onbekende fout op.'
            })
        });
    }
}

module.exports = Products;
