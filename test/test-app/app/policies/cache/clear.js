'use strict';

var asyncjs = require('async'),
    joi = require('joi');

module.exports = function(req, res, next) {
    asyncjs.auto({
        validate: function validateRequestParameters(fn) {
            var valid = joi.object({
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

        authorize: ['validate', function authorizeClearPath(fn, r) {
            if (!req.user.groups || !req.user.groups.length) {
                res.json(403, {error: 'Insufficient privelages'});
                return fn(true);
            }

            req.microservice.services['permissions'].find({
                type: 'cache',
                resource: 'cache',
                data: {
                    groups: req.user.groups,
                    path: r.validate.path
                }
            }, function(err, permissions) {
                if (err) {
                    req.microservice.log('error', err);
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
            if (err === true) return;
            return res.json(500, {error: err});
        }
        next();
    });
};
