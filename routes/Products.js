"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
const ArrayIntersect = require('array-intersection');

class Products extends Base {

    /**
     * Authentication class
     * Dealing with group login and logouts
     * @param router
     */
    constructor() {
        super(router);

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
                    request.user.save();
                    response.json({
                        success: true,
                        data: request.user.getAllData()
                    });
                } else {
                    response.json({
                        success: false,
                        error: 'PRODUCT_ALREADY_SCANNED',
                        msg: 'Paniek! Dit product zit al in je winkelwagen.'
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
                for(let prod of request.user.products) {
                    if(prod._id === scanned._id) {
                        product = prod;
                        break;
                    }
                }

                if(product === null) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_NOT_SCANNED',
                        msg: 'Paniek! Je kan geen punten krijgen voor dit product als het niet in je winkelmandje zit!'
                    });
                    return;
                }

                if(!product.bought) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_NOT_UNLOCKED',
                        msg: 'Paniek! Je kan geen punten krijgen voor dit product omdat je hem nog niet unlocked hebt.'
                    });
                    return;
                }

                if(product.rewarded) {
                    response.json({
                        success: false,
                        error: 'PRODUCT_ALREADY_REWARDED',
                        msg: 'Hee! Je hebt al punten gekregen voor dit product!'
                    });
                    return;
                }

                request.user.points += product.reward;
                product.rewarded = true;
                request.user.save();
                response.json({
                    success: true,
                    data: request.user.getAllData()
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
        Product.findByCode(input['code'], function (error, rewards) {
            if (error || rewards.length === 0) {
                response.json({
                    success: false,
                    error: 'CODE_UNKNOWN',
                    msg: 'Helaas, deze code is ongeldig.'
                });
            } else {
                if (request.user.addReward(rewards[0])) {
                    request.user.save();
                    response.json({
                        success: true,
                        data: request.user.getAllData()
                    });
                } else {
                    response.json({
                        success: false,
                        error: 'REWARD_ALREADY_SCANNED',
                        msg: 'Paniek! Je hebt deze reward al ontvangen.'
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
        if(input.action !== 'unlock') {
            response.json({
                success: false,
                error: 'ACTION_UNKNOWN',
                msg: 'Deze actie bestaat niet.'
            });
            return;
        }

        // verify that product is scanned
        let product = null;
        for(let prod of request.user.products) {
            if(prod._id === input.productId._id) {
                product = prod;
                break;
            }
        }

        if(product === null) {
            response.json({
                success: false,
                error: 'PRODUCT_NOT_SCANNED',
                msg: 'Je kan het product niet unlocken als je het nog niet gescand hebt.'
            });
            return;
        }

        // verify that product is not already unlocked
        if(product.bought === true) {
            response.json({
                success: false,
                error: 'PRODUCT_ALREADY_UNLOCKED',
                msg: 'Je hebt dit product al unlocked, je hoeft niks te doen.'
            });
            return;
        }

        // verify that group has enough credits
        if(request.user.credits < product.costs) {
            response.json({
                success: false,
                error: 'NOT_ENOUGH_CREDITS',
                msg: 'Je hebt niet genoeg actiepunten om dit product te unlocken.'
            });
            return;
        }

        // unlock product
        product.bought = true;
        request.user.credits = request.user.credits - product.costs;
        request.user.save();
        response.json({
            success: true,
            data: request.user.products
        });
    }
}

module.exports = new Products();
