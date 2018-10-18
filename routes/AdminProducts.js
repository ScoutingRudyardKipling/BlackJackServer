"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Reward = require('../models/Reward');

class AdminProducts extends Base {

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
        // allow listing products
        this.regRoute('get', '/', [], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getProducts.bind(this));

        // allow showing products
        this.regRoute('get', '/:productId', ['productId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getProduct.bind(this));

        // allow creating a product
        this.regRoute('post', '/', ['name', 'description', 'code', 'rewardCode', 'image', 'costs', 'reward'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.postProduct.bind(this));

        // allow updating product
        this.regRoute('put', '/:productId', ['productId'], ['name', 'description', 'code', 'rewardCode', 'image', 'costs', 'reward'], true)
            .before(this.requireAuthAdmin)
            .then(this.updateProduct.bind(this));

        // allow deleting product
        this.regRoute('delete', '/:productId', ['productId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.deleteProduct.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getProducts(request, input, response) {
        var filter = {};
        var products = [];
        Product.findAll(filter, function (err, prodList) {
            if (err) return response.status(400).send({message: err});

            for (let prod of prodList) {
                products.push(prod.getAllData());
            }

            response.json({
                filter: filter,
                data: products
            });
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    postProduct(request, input, response) {
        if(input['code'] === input['rewardCode']) {
            response.status(409).json({
                success: false,
                message: 'codes cant be equal!'
            });
            return;
        }

        Promise.all([
            Reward.promiseCodeIsUnique(input['code']),
            Reward.promiseCodeIsUnique(input['rewardCode']),
            Product.promiseCodeIsUnique(input['code']),
            Product.promiseCodeIsUnique(input['rewardCode']),
            Product.promiseRewardCodeIsUnique(input['code']),
            Product.promiseRewardCodeIsUnique(input['rewardCode'])
        ]).then(function () {
            // both codes are unique
            let product = new Product({
                name: input['name'],
                description: input['description'],
                code: input['code'],
                rewardCode: input['rewardCode'],
                image: input['image'],
                costs: input['costs'],
                reward: input['reward']
            });

            product.save(function (err) {
                if (err) {
                    console.log(err);
                    return response.status(500).json({
                        error: err,
                        success: false
                    });
                }

                response.json({
                    success: true
                });
            });
        }).catch(function () {
            response.status(409).json({
                success: false,
                message: 'one of the codes is already chosen, please choose another one'
            });
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @returns {*}
     */
    getProduct(request, input, response) {
        return response.json(input.productId.getPublicData());
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    updateProduct(request, input, response) {
        for (var i in input) {
            if (i !== 'productId' && input[i] !== null && input[i] !== undefined) {
                input.productId[i] = input[i];
            }
        }

        input.productId.save(function (err, goal, numAffected) {
            if (err) {
                response.status(400).send({message: err});
            } else if (numAffected <= 0) {
                response.status(400).send({message: 'Wrong id or data.'});
            } else {
                response.send({message: 'Put succes!'});
            }
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    deleteProduct(request, input, response) {
        input.productId.remove();
        response.send({message: 'Delete succes!'});
    }
}

module.exports = AdminProducts;
