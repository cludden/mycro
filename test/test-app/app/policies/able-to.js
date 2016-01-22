'use strict';

var asyncjs = require('async'),
    _ = require('lodash');

module.exports = function(ability, resource) {
    return function(req, res, next) {
        if (!req.user) {
            var e = 'unauthenticated';
            res.json(401, {error: e});
            return next(e);
        }
        asyncjs.auto({
            groups: function findGroupsUserIsMemberOf(fn) {
                req.mycro.services['data'].find('groups', {users: [req.user.id]}, function(err, groups) {
                    if (err) return fn(err);
                    fn(null, groups || []);
                });
            },

            permission: function findMatchingPermission(fn) {
                req.mycro.services['data'].find('permissions', {
                    type: 'ability',
                    resource: resource,
                    data: {
                        ability: ability
                    }
                }, function(err, permissions) {
                    if (err) return fn(err);
                    if (!permissions || !permissions.length) return fn('invalid ability/resource');
                    var p = permissions[0];
                    if (!p.groups || !p.groups.length) return fn('permission has not been assigned');
                    fn(null, p);
                });
            },

            authorize: ['groups', 'permission', function(fn, r) {
                var groupIds = _.pluck(r.groups, 'id');
                if (!_.intersection(groupIds, r.permission.groups).length) return fn('user does not have required ability');
                fn();
            }]
        }, function(err) {
            if (err) {
                req.mycro.log('silly', '[policy] able-to (' + ability + ', ' + resource + ') failed:', err);
                res.json(403, {error: err});
                return next(err);
            }
            next();
        });
    };
};
