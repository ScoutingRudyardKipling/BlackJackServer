"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Group = require('../models/Group');
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
        // allow listing products
        this.regRoute('get', '/', [], [], true).then(this.getProducts.bind(this));

        // allow showing products
        this.regRoute('get', '/:productId', [], [], true).then(this.getProduct.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getProducts(request, input, response) {
        console.log(request.user);

        response.json({
            data: request.user.getAllData()
        });
        // var filter = {};
        // var groups = [];
        // Group.findAll(filter, function(err, us){
        //     if (err) return response.status(400).send({msg:err});
        //
        //     for(var index in us) {
        //         groups.push(us[index].getPublicData());
        //     }
        //
        //     response.json({
        //         filter: filter,
        //         data: groups
        //     });
        // });
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
}

module.exports = new Products();
