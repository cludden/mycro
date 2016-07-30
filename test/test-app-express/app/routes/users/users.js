'use strict';

module.exports = function(mycro) {
    const policies = mycro.policies;
    
    return {
        route(r) {
            r.use(policies.authenticate());
            r.get('users/query');
            r.post('users/create');
        }
    };
};
