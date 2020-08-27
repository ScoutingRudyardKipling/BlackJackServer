"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var Group = require('../models/Group');

class Auth extends Base {

    /**
     * Authentication class
     * Dealing with user login and logouts
     * @param router
     */
    constructor(app) {
        super(app, router);

        // apply middleware if necessary
        router.use(function (req, res, next) {
            next();
        });

        // add routes to router
        this.resolve();
    }

    /**
     * Resolve routes
     */
    resolve() {

        // allow logging in
        this.regRoute('post', '/login', [
            'name', 'password'
        ], [])
            .then(this.postLogin.bind(this));

        // get current authenticated user
        this.regRoute('get', '/users/current', [], [], true).then(this.getCurrentUser.bind(this));
    }

    /**
     * Submit credentials in order to login
     * @param request
     * @param input
     * @param response
     */
    postLogin(request, input, response, next) {
        passport.authenticate('local', function (e, group, error, something) {
            if (error) {
                return response.status(401).json({
                    success: false,
                    message: 'invalid credentials'
                });
            }

            // create new token
            var token = group.generateToken();
            group.save();

            // send success
            response.json({
                id: group._id,
                token: token
            });
        }).apply(this, [request, response]);
    }

    /**
     * Get the current user
     * @param request
     * @param input
     * @param response
     */
    getCurrentUser(request, input, response) {
        response.json(request.user.getAllData());
    }

    /**
     *
     * @param id
     * @param password
     */
    changePasswordForUserId(response, id, password) {
        Group.findOne({_id: id}, function (err, user) {
            user.setPassword(password, function (err) {
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                        return response.status(500).json({
                            error: err,
                            success: false
                        });
                    }

                    response.json({});
                });
            });
        });
    }
}

module.exports = Auth;
