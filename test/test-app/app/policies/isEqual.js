'use strict';

const _ = require('lodash');

module.exports = function(mycro) {
    return function(pathA, pathB) {
        return function isEqual(req, res, next) {
            const a = _.get(req, pathA);
            const b = _.get(req, pathB);
            if (a !== b && a.toString() !== b.toString()) {
                const e = a + ' does not equal ' + b;
                mycro.log('silly', '[policy] is-equal failed:', e);
                res.json(403, {error: e});
                return next(e);
            }
            mycro.log('silly', '[policy] is-equal passed:', a, b);
            next();
        };
    };
};
