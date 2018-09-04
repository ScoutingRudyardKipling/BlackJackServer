"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
const ArrayIntersect = require('array-intersection');

class AdminProducts extends Base {

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
        // allow listing products
        this.regRoute('get', '/', [], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getProducts.bind(this));

        // allow showing products
        this.regRoute('get', '/:productId', ['productId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getProduct.bind(this));

        // allow creating a product
        this.regRoute('post', '/', ['name', 'code', 'image', 'costs', 'reward'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.postProduct.bind(this));

        // allow updating product
        this.regRoute('put', '/:productId', ['productId'], ['name', 'code', 'image', 'costs', 'reward'], true)
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
            if (err) return response.status(400).send({msg: err});

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
        Product.codeIsUnique(input['code'], function (error, success) {
            if (!success) {
                // code is duplicate

                response.status(409).json({
                    success: false,
                    message: 'code is already chosen, please choose another one'
                });
                return;
            }


            // code is not duplicate
            let product = new Product({
                name: input['name'],
                code: input['code'],
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
                response.status(400).send({msg: err});
            } else if (numAffected <= 0) {
                response.status(400).send({msg: 'Wrong id or data.'});
            } else {
                response.send({msg: 'Put succes!'});
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
        response.send({msg: 'Delete succes!'});
    }
}

module.exports = new AdminProducts();
