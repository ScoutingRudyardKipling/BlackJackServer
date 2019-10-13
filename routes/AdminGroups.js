"use strict";

let Base = require('./Base');
let express = require('express');
let router = express.Router();
let Group = require('../models/Group');
const ArrayIntersect = require('array-intersection');

class AdminGroups extends Base {

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
        this.regRoute('get', '/', [], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getGroups.bind(this));

        // allow showing groups
        this.regRoute('get', '/:groupId', ['groupId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.getGroup.bind(this));

        // allow creating a group
        this.regRoute('post', '/', ['password', 'name', 'group', 'type'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.postGroup.bind(this));

        // allow updating groups
        this.regRoute('put', '/:groupId', ['groupId'], ['password', 'name', 'group', 'type', 'credits', 'points'], true)
            .before(this.requireAuthAdmin)
            .then(this.updateGroup.bind(this));

        // allow deleting groups
        this.regRoute('delete', '/:groupId', ['groupId'], [], true)
            .before(this.requireAuthAdmin)
            .then(this.deleteGroup.bind(this));
    };

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    getGroups(request, input, response) {
        let filter = {};
        let groups = [];
        Group.findAll(filter, function (err, groupList) {
            if (err) return response.status(400).send({message: err});

            for (let gr of groupList) {
                groups.push(gr.getAllData());
            }

            response.json({
                filter: filter,
                data: groups
            });
        });
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    postGroup(request, input, response) {
        if (['participant', 'administrator'].indexOf(input.type) === -1) {
            return response.status(400).json({
                success: false,
                error: 'INVALID_TYPE',
                message: 'Type ' + input.type + ' is invalid'
            });
        }

        Group.nameIsUnique(input['name'], function (error, success) {
            if (!success) {
                // name is duplicate

                response.status(409).json({
                    success: false,
                    message: 'name is already chosen, please choose another one'
                });
                return;
            }


            // name is not duplicate
            let group = new Group({
                name: input['name'],
                group: input['group'],
                type: input['type'],
                products: [],
                rewards: [],
                points: 0,
                credits: 0
            });

            group.setPassword(input['password'], function (err) {
                group.save(function (err) {
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
        });

    }

    /**
     *
     * @param request
     * @param input
     * @param response
     * @returns {*}
     */
    getGroup(request, input, response) {
        return response.json(input.groupId.getPublicData());
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    updateGroup(request, input, response) {


        var promises = [];
        let group = input.groupId;
        var simpleModifications = ArrayIntersect(Object.keys(input), ['group', 'credits', 'points']);
        var updatingname = (input.name !== undefined && input.name !== group.name);

        if (updatingname) {
            promises.push(Group.promiseNameIsUnique(input.name));
        }

        if (input.password !== undefined) {
            promises.push(group.promiseSetPassword(input.password));
        }

        if (input.type !== undefined && ['participant', 'administrator'].indexOf(input.type) > -1) {
            promises.push(new Promise(function (resolve, reject) {
                group.type = input.type;
                resolve();
            }));
        }

        if(simpleModifications.length > 0) {
            promises.push(new Promise(function (resolve, reject) {
                for(let index in simpleModifications) {
                    let key = simpleModifications[index];
                    if(input[key] !== undefined) {
                        group[key] = input[key];
                    }
                }

                resolve();
            }));
        }

        if (promises.length > 0) {
            Promise.all(promises).then(function resolve() {
                if(updatingname) {
                    group.name = input.name;
                }
                group.save(function (err) {
                    if (err) {
                        return response.status(400).json({
                            success: false,
                            error: 'UPDATE_FAILED',
                            message: err
                        });
                    }

                    response.json({
                        success: true
                    });
                });
            }, function reject(reason) {
                return response.status(400).json({
                    success: false,
                    error: 'UPDATE_FAILED',
                    message: 'An error occured during the update procedure. The name might be a duplicate'
                });
            });
        } else {
            return response.status(400).json({
                success: false,
                error: 'NOTHING_TO_UPDATE',
                message: 'No fields are marked for update'
            });
        }
    }

    /**
     *
     * @param request
     * @param input
     * @param response
     */
    deleteGroup(request, input, response) {
        input.groupId.remove();
        response.send({message: 'Delete succes!'});
    }
}

module.exports = AdminGroups;
