'use strict';

module.exports = function(group) {
    return function(req, res, next) {
        if (!req.user || !req.user.id) {
            var e = 'unauthenticated';
            res.json(401, {error: e});
            return next(e);
        }
        req.mycro.services['data'].find('groups', {name: group}, function(err, _group) {
            if (err) {
                res.json(500, {error: err});
                return next(err);
            }
            if (!_group || !_group.length) {
                err = 'no group found with name (' + group + ')';
                res.json(500, {error: err});
                return next(err);
            }
            _group = _group[0];
            if (!_group.users || !_group.users.length || _group.users.indexOf(req.user.id) === -1) {
                err = 'user is not a member of group (' + group + ')';
                res.json(403, {error: err});
                return next(err);
            }
            next();
        });
    };
};
