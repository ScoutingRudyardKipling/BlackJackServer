"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Group = require('../models/Group');

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
        this.regRoute('get', '/current', [], [], true).then(this.getCurrentGroup.bind(this));

        // register fcm token
        this.regRoute('post', '/current/fcm', ['token'], [], true).then(this.postFCMToken.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getGroups(request, input, response) {
        const hour = (new Date()).getHours();
        if(hour > 20 || hour < 1) {
            response.json({
                filter: {},
                data: {scores:[]},
                success: true
            });
            return;
        }

        var filter = {};
        var groups = [];
        Group.findAll(filter, function (err, us) {
            if (err) return response.status(400).send({message: err});

            for (var index in us) {
                if(us[index].type === 'administrator') {
                    continue;
                }
                groups.push(us[index].getPublicData());
            }

            this.broadcast('highscores', groups);
            this.sendToAuthenticatedGroup(request, 'get groups', {});

            response.json({
                filter: filter,
                data: {scores:groups},
                success: true
            });
        }.bind(this));
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getCurrentGroup(request, input, response) {
        return response.json({
            success: true,
            data: request.user.getAllData()
        });
    }

    /**
     * Submit credentials in order to login
     * @param request
     * @param input
     * @param response
     */
    postFCMToken(request, input, response) {
        let group = request.user;
        let fcm = input['token'];

        if(group.FCMTokens.indexOf(fcm) > -1) {
            response.json({
                success: false,
                message: "Token wordt al gebruikt"
            });
        } else {
            group.FCMTokens.push(fcm);
            group.save();
            response.json({
                success: true,
                data: {}
            });
        }
    }


}

module.exports = Groups;
