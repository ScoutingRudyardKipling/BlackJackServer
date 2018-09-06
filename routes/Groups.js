"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Group = require('../models/Group');
const ArrayIntersect = require('array-intersection');

class Groups extends Base {

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
        this.regRoute('get', '/', [], [], true).then(this.getGroups.bind(this));

    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getGroups(request, input, response) {
        var filter = {};
        var groups = [];
        Group.findAll(filter, function(err, us){
            if (err) return response.status(400).send({msg:err});

            for(var index in us) {
                groups.push(us[index].getPublicData());
            }

            this.broadcast('highscores', groups);
            this.sendToAuthenticatedGroup(request, 'get groups', {});

            response.json({
                filter: filter,
                data: groups
            });
        }.bind(this));
    }


}

module.exports = Groups;
