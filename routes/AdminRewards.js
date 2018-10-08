"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var Reward = require('../models/Reward');
var Product = require('../models/Product');

class AdminRewards extends Base {

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
        // allow listing rewards
        this.regRoute('get', '/', [], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getRewards.bind(this));

        // allow showing rewards
        this.regRoute('get', '/:rewardId', ['rewardId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getReward.bind(this));

        // allow creating a rewards
        this.regRoute('post', '/', ['reward', 'type', 'code'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.postReward.bind(this));

        // allow updating reward
        this.regRoute('put', '/:rewardId', ['rewardId'], ['reward', 'type', 'code'], true)
            .before(this.requireAuthAdmin)
            .then(this.updateReward.bind(this));

        // allow deleting rewards
        this.regRoute('delete', '/:rewardId', ['rewardId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.deleteReward.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getRewards(request, input, response) {
        var filter = {};
        var rewards = [];
        Reward.findAll(filter, function (err, rewList) {
            if (err) return response.status(400).send({message: err});

            for (let rew of rewList) {
                rewards.push(rew.getAllData());
            }

            response.json({
                filter: filter,
                data: rewards
            });
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    postReward(request, input, response) {
        if(input['type'] !== 'actionpoint' && input['type'] !== 'point') {
            return response.status(500).json({
                error: "Kies een degelijk type anders",
                success: false
            });
        }

        Promise.all([
            Reward.promiseCodeIsUnique(input['code']),
            Product.promiseCodeIsUnique(input['code']),
            Product.promiseRewardCodeIsUnique(input['code'])
        ]).then(function () {
            // both codes are unique
            let reward = new Reward({
                code: input['code'],
                reward: input['reward'],
                type: input['type'],
            });

            reward.save(function (err) {
                if (err) {
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
    getReward(request, input, response) {
        return response.json(input.rewardId.getAllData());
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    updateReward(request, input, response) {
        if(input.hasOwnProperty('type') && (input['type'] !== 'actionpoint' && input['type'] !== 'point')) {
            return response.status(500).json({
                error: "Kies een degelijk type anders",
                success: false
            });
        }

        for (var i in input) {
            if (i !== 'rewardId' && input[i] !== null && input[i] !== undefined) {
                input.rewardId[i] = input[i];
            }
        }

        input.rewardId.save(function (err, goal, numAffected) {
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
    deleteReward(request, input, response) {
        input.rewardId.remove();
        response.send({message: 'Delete succes!'});
    }
}

module.exports = AdminRewards;
