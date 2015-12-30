'use strict';

var _ = require('lodash');

module.exports = function(policy) {
    return function(req, res, next) {
        var fakeRes = {
            json: _.noop,
            status: function() {
                return {
                    send: _.noop
                };
            }
        };
        policy(req, fakeRes, function(err) {
            if (!err) {
                res.json(403, {error: 'Forbidden'});
                return next('Forbidden');
            }
            next();
        });
    };
};
