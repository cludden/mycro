'use strict';

module.exports = function(microservice) {
    return {
        additionalPolicies: [
            microservice.policies['member-of']('admins')
        ],
        '/cache': {
            '/clear': {
                additionalPolicies: [
                    'cache/clear'
                ],
                get: 'cache.clear'
            }
        },
        '/config': 'rest'
    };
};
