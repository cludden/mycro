'use strict';

module.exports = function(req, res, next) {
    res.set('x-app-version', '2.0.0');
    next();
};
