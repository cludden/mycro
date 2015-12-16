'use strict';

module.exports = function(item) {
    return function(req, res, next) {
        res.set('X-Blacklisted-Item', item);
        next();
    };
};
