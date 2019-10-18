"use strict";

let express = require('express');
let router = express.Router();
let passport = require('../lib/passport');
const MiddlewareBuilder = require('../lib/middlewarebuilder');
let models = {
    groupId: require('../models/Group'),
    productId: require('../models/Product'),
    rewardId: require('../models/Reward')
};

class Base {

    constructor(app, router) {
        //noinspection JSUnresolvedVariable
        this.router = router;
        this.app = app;
    }

    /**
     *
     * @param method
     * @param path
     * @param required
     * @param optional
     * @param callable
     * @param withAuthentication
     * @param router
     */
    regRoute(method, path, required, optional, withAuthentication, router) {
        router = (router || this.router);
        let routerMethod = router[method];

        // create builder
        var builder = new MiddlewareBuilder(routerMethod, router, this, path);

        // apply authentication?
        if (withAuthentication) {
            builder.before(this._requireAuthentication.bind(this));
        }

        // apply argument resolving
        builder.before(function (request, parameters, response, next) {
            let params = this._get(required, optional, request);
            console.log('params', params, request.body);

            // invalid arguments for call
            if (params === false) {
                return response.status(400).json({
                    success: false,
                    message: 'Missing parameters'
                });
            }

            // resolve params
            this._resolveParams(params, request, function (error, params) {
                if (error) {
                    return response.status(404).json({
                        success: false,
                        message: 'Objects could not be resolved'
                    });
                }

                builder.setParameters(params);

                next();
            });
        }.bind(this));

        return builder;
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @param next
     */
    requireAuthAdmin(request, input, response, next) {
        if (request.user.type === 'administrator') {
            next();
        } else {
            response.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    }

    broadcast(channel, data) {
        this.app.IOController.broadcast(channel, data);
    }

    sendToAuthenticatedGroup(request, event, data) {
        this.app.IOController.sendToGroup(request.user._id, event, data);
    }

    /**
     * Middleware to perform token authentication
     * @param req
     * @param res
     * @param next
     * @private
     */
    _requireAuthentication(req, parameters, res, next) {
        passport.authenticate('token', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Incorrect token credentials'
                });
            }

            req.user = user;
            next();
        })(req, res, next);

    }

    /**
     * Get a list of parameters from the request header
     * @param required
     * @param optional
     * @param req
     * @returns {*}
     * @private
     */
    _get(required, optional, req) {
        var fields = {};

        // get required fields
        for (var i in required) {
            let value = this._getField(req, required[i]);
            if (!value) {
                console.log(required[i], this._getField(req, required[i]));
                return false;
            }

            fields[required[i]] = value;
        }

        // get optional fields
        for (var i in optional) {
            fields[optional[i]] = this._getField(req, optional[i]);
        }

        return fields;
    }

    /**
     * Get a specific parameter from the request header
     * @param req
     * @param name
     * @returns {*}
     * @private
     */
    _getField(req, name) {
        for (var scope in {body: 1, params: 1, query: 1}) {
            var value = this._getFieldFromContext(req, name, scope);
            if (value !== undefined) {
                return value;
            }
        }
        return undefined;
    }

    /**
     * Get a specific parameter from a specific part of the request header
     * @param req
     * @param name
     * @param context
     * @returns {*}
     * @private
     */
    _getFieldFromContext(req, name, context) {
        if (!req[context]) {
            return null;
        }

        return req[context][name];
    }

    /**
     * Resolve a parameter into the related object, if exists of course
     * @param params
     * @param callback
     * @private
     */
    _resolveParams(params, request, callback) {
        var promises = [];

        // prepare promises
        for (let name in params) {
            let value = params[name];

            if (value !== null && models[name]) {
                promises.push(this._promiseResolveParams(name, Number(value)));
            }
        }

        // if nothing has to be resolved
        if (promises.length == 0) {
            callback(null, params);
            return;
        }

        // if something needs to be resolved
        Promise.all(promises).then(function (data) {
            for (let index in data) {
                let key = data[index][0];
                let value = data[index][1];
                params[key] = value;
                request.params[key] = value;
            }
            callback(null, params);
        }).catch(function (error) {
            callback(error, []);
        });
    }

    /**
     * Get a promise to resolve a specific parameter into the related object
     * @param type
     * @param id
     * @returns {Promise}
     * @private
     */
    _promiseResolveParams(type, id) {
        return new Promise(function (resolve, reject) {
            models[type].findOne({
                _id: id
            }, function (error, object) {
                if (error || !object) {
                    reject(error || {
                        description: 'Object reference not found'
                    });
                } else {
                    resolve([type, object]);
                }
            });
        });
    }

}

module.exports = Base;
