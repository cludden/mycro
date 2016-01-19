'use strict';

var _ = require('lodash');

module.exports = function(pathA, pathB) {
    return function(req, res, next) {
        var a = _.get(req, pathA),
            b = _.get(req, pathB);
        if (a !== b && a.toString() !== b.toString()) {
            var e = a + ' does not equal ' + b;
            req.mycro.log('silly', '[policy] is-equal failed:', e);
            res.json(403, {error: e});
            return next(e);
        }
        req.mycro.log('silly', '[policy] is-equal passed:', a, b);
        next();
    };
};
