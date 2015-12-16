'use strict';

module.exports = function(req, res, next) {
    req.defaultMiddlewareWasRun = true;
    next();
};
