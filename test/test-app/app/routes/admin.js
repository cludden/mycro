'use strict';

module.exports = function(mycro) {
    return {
        additionalPolicies: [
            mycro.policies['member-of']('admins')
        ],
        '/cache': {
            '/clear': {
                additionalPolicies: [
                    'cache/clear'
                ],
                post: 'cache.clear'
            }
        },
        '/config': {
            options: {
                model: 'config'
            },
            routes: 'rest'
        },
        '/test': {
            policies: [],
            get: function(req, res) {
                res.json(200, {message: 'ok'});
            }
        }
    };
};
