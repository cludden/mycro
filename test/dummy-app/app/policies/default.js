'use strict';

module.exports = function(req, res, next) {
    res.set('X-Default-Middleware', 'true');
    next();
};
