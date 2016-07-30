'use strict';

module.exports = function(mycro) {
    const params = mycro.params;
    const policies = mycro.policies;

    return {
        route(r) {
            r.param('user_id', params.populateUser());
            r.delete(
                policies.hasRole('admin'),
                policies.not(
                    policies.isEqual('params.user_id', 'uid')
                ),
                'users/remove'
            );
            r.get(policies.isEqual('params.user_id', 'uid'), 'users/detail');
            r.patch(
                policies.or(
                    policies.isEqual('params.user_id', 'uid'),
                    policies.hasRole('admin')
                ),
                policies.validateRequest('/users/update'),
                'users/update'
            );
        }
    };
};
