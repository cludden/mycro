'use strict';

module.exports = function(mycro) {
    const params = mycro.params;
    const policies = mycro.policies;

    return {
        '/api': {
            route(r) {
                r.use(policies.random('random', 1, 100));
            },
            '/v1': {
                options: {
                    version: 1
                },
                route(r) {
                    r.use(policies.random('random1', 101, 1999));
                },
                '/users': {
                    route(r) {
                        r.use(policies.authenticate({ anonymous: true }));
                        r.get('users/query');
                        r.post(
                            policies.hasRole('admin'),
                            'users/create'
                        );
                    },
                    '/:user_id': {
                        break: true,
                        route(r) {
                            r.use(policies.authenticate());
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
                                policies.validateRequest('/users/update')
                            );
                        }
                    }
                }
            },
            '/v2': {
                options: {
                    version: 2
                },
                route(r) {
                    r.use(policies.random('random2', 2000, 3000));
                },
                '/test': {
                    mount: 'test'
                },
                '/users': {
                    mount: 'users/users',
                    '/:user_id': {
                        mount: 'users/user'
                    }
                }
            }
        },
        '/health': {
            route(r) {
                r.get('healthcheck');
            }
        }
    };
};
