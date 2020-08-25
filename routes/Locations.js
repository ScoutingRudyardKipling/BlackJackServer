"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Location = require('../models/Location');

class Locations extends Base {

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
        // allow listing groups
        this.regRoute('post', '/', ['lat', 'lon'], [], true).then(this.postLocation.bind(this));

    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    postLocation(request, input, response) {
        let location = new Location({
            groupId: request.user._id,
            location: [input['lat'], input['lon']],
            date: new Date()
        });

        location.save(function (err) {
            if (err) {
                console.log(err);
                return response.status(500).json({
                    error: err,
                    success: false
                });
            }
        });

        response.json({
            success: true
        });
    }


}

module.exports = Locations;
