'use strict';

var asyncjs = require('async'),
    _ = require('lodash');

module.exports = function() {
    var policies = Array.prototype.slice.call(arguments);
    return function(req, res, next) {
        var fakeRes = {
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
