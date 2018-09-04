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
                self.postReward(request, input, response);
            } else {
                if (request.user.addProduct(products[0])) {
                    request.user.save();
                    response.json({
                        success: true,
                        data: request.user.products
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
                        data: request.user.rewards
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
}

module.exports = new Products();
