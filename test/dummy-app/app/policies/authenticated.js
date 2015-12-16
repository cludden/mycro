'use strict';

module.exports = function(req, res, next) {
    if (req.headers && req.headers['authorization'] && req.headers['authorization'] === 'Bearer abc') {
        return next();
    }
    res.json(403, {error: 'Forbidden'});
};
