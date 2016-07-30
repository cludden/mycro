'use strict';

const _ = require('lodash');

module.exports = function() {
    return function(policy) {
        return function not(req, res, next) {
            const fakeRes = {
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
};
