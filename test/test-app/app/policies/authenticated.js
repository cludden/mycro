'use strict';

module.exports = function(req, res, next) {
    if (!req.headers['x-user-id']) {
        var e = 'unauthenticated';
        res.json(401, {error: e});
        return next(e);
    }
    req.microservice.services['data'].detail('users', parseInt(req.headers['x-user-id']), function(err, user) {
        if (err) {
            res.json(500, {error: err});
            return next(err);
        }
        if (!user) {
            err = 'no user found with id (' + parseInt(req.headers['x-user-id']) + ')';
            res.json(500, {error: err});
            return next(err);
        }
        req.user = user;
        next();
    });
};
