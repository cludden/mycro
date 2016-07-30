'use strict';

const asyncjs = require('async');
const joi = require('joi');

module.exports = function(mycro) {
    return function canClearCache(req, res, next) {
        asyncjs.auto({
            validate: function validateRequestParameters(fn) {
                const valid = joi.object({
                    path: joi.string()
                }).required();

                joi.validate(req.body, valid, {stripUnknown: true}, function(err, values) {
                    if (err) {
                        res.json(400, {error: err});
                        return fn(true);
                    }
                    fn(null, values);
                });
            },

            groups: ['validate', function findUserGroups(fn) {
                mycro.services['data'].find('groups', {users: [1]}, function(err, groups) {
                    if (err) {
                        res.json(500, {error: err});
                        return fn(true);
                    }
                    if (!groups || !groups.length) {
                        res.json(403, {error: 'Insufficient privelages'});
                        return fn(true);
                    }
                    fn(null, groups);
                });
            }],

            authorize: ['groups', function authorizeClearPath(fn, r) {
                mycro.services['permissions'].find({
                    type: 'cache',
                    resource: 'cache',
                    data: {
                        groups: r.groups,
                        path: r.validate.path
                    }
                }, function(err, permissions) {
                    if (err) {
                        req.mycro.log('error', err);
                        return fn(err);
                    }
                    if (!permissions || !permissions.length) {
                        res.json(403, {error: 'Insufficient privelages'});
                        return fn(true);
                    }
                    fn();
                });
            }]
        }, function(err) {
            if (err) {
                console.log(err);
                if (err === true) return;
                return res.json(500, {error: err});
            }
            next();
        });
    };
};
