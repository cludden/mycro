'use strict';

module.exports = function(group) {
    return function(req, res, next) {
        if (!req.user || !req.user.id) {
            var e = 'unauthenticated';
            res.json(401, {error: e});
            return next(e);
        }
        req.microservice.services['data'].detail('groups', {name: group}, function(err, group) {
            if (err) {
                res.json(500, {error: err});
                return next(err);
            }
            if (!group) {
                err = 'no group found with name (' + group + ')';
                res.json(500, {error: err});
                return next(err);
            }
            if (!group.users || !group.users.length || group.users.indexOf(req.user.id) === -1) {
                err = 'user is not a member of group (' + group + ')';
                res.json(403, {error: err});
                return next(err);
            }
            next();
        });
    };
};
