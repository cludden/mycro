'use strict';

const asyncjs = require('async');
const _ = require('lodash');

module.exports = function() {
    return function() {
        const policies = Array.prototype.slice.call(arguments);

        return function or(req, res, next) {
            const fakeRes = {
                json: function() {},
                status: function() {
                    return {
                        send: function() {}
                    };
                }
            };

            asyncjs.some(policies, function(policy, fn) {
                policy(req, fakeRes, function(err) {
                    fn(_.isEmpty(err));
                });
            }, function(ok) {
                if (!ok) {
                    res.json(403, {error: 'all policies failed'});
                    return next('all policies failed');
                }
                next();
            });
        };
    };
};
