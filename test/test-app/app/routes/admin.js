'use strict';

module.exports = function(mycro) {
    const policies = mycro.policies;
    return {
        additionalPolicies: [
            policies.memberOf('admins')
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
