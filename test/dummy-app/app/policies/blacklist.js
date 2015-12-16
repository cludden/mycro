'use strict';

module.exports = function(item) {
    return function(req, res, next) {
        req.blacklist = [item];
        next();
    };
};
