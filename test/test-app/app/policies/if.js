'use strict';

var asyncjs = require('async'),
    _ = require('lodash');

module.exports = function(test, trueFn, falseFn) {
    return function(req, res, next) {
        var fakeRes = {
            json: _.noop,
            status: function() {
                return {
                    send: _.noop
                };
            }
        };

        asyncjs.waterfall([
            function runTest(fn) {
                test(req, fakeRes, function(err) {
                    if (err) return fn(null, false);
                    fn(null, true);
                });
            },

            function handleResult(passed, fn) {
                var handler = trueFn;
                if (!passed) handler = falseFn;
                if (!handler) return fn();
                handler(req, res, fn);
            }
        ], function() {
            return next();
        });
    };
};
