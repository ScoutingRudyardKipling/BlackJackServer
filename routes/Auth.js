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
    // postLogin(request, input, response) {
    postLogin(request, input, response, next) {

        // let rk = new Group({
        //     name: 'admin',
        //     token: '',
        //     type: 'administrator',
        //     group: 'Scouting Rudyard Kipling'
        // });
        //
        // rk.setPassword('zoetapoetaHuppeldepup', function (err) {
        //     rk.save(function (err) {
        //         if (err) {
        //             console.log(err);
        //             return response.status(500).json({
        //                 error: err,
        //                 success: false
        //             });
        //         }
        //
        //         response.json({
        //             success: true
        //         });
        //     });
        // });
        //
        // return;


        passport.authenticate('local', function (e, group, error, something) {
            if (error) {
                return response.json({
                    success: false,
                    message: 'invalid credentials'
                });
            }

            // create new token
            var token = group.generateToken();
            group.save();

            // send success
            response.json({
                success: true,
                data: {
                    id: group._id,
                    token: token
                }
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
}

module.exports = Auth;