'use strict';

module.exports = function(mycro) {
    return function authenticated(req, res, next) {
        const uid = parseInt(req.headers['x-user-id']);
        if (isNaN(uid)) {
            const e = 'unauthenticated';
            res.json(401, {error: e});
            return next(e);
        }
        mycro.services['data'].detail('users', uid, function(err, user) {
            if (err) {
                res.json(500, {error: err});
                return next(err);
            }
            if (!user) {
                err = 'no user found with id (' + uid + ')';
                res.json(500, {error: err});
                return next(err);
            }
            req.user = user;
            next();
        });
    };
};
