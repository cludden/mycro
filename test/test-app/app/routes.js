'use strict';

module.exports = function(mycro) {
    return {
        // define version for all paths
        'v1.0.0': {
            '/api': {
                // define `req.options` for path and sub-paths
                // these options will be available in policies and controllers at `req.options`
                options: {
                    desc: 'welcome to the api v1.0.0'
                },
                // define policies for path and sub-path
                policies: [
                    'authenticated' // authenticated policy (/app/policies/authenticated.js)
                ],
                // define sub-path
                '/admin': 'admin', // mount `admin` routes at this path (/app/routes/admin.js)
                '/blog': {
                    get: 'blog/posts'
                },
                '/groups': {
                    // `req.options` can be augmented at sub-paths
                    //      console.log(req.options) => {desc: 'welcome to the api v1.0.0', model: 'groups'}
                    options: {
                        model: 'groups'
                    },
                    // define additional policies to add to the policy chain for path and sub-paths
                    additionalPolicies: [
                        // policies can also be factory functions
                        mycro.policies['able-to']('manage', 'groups')
                    ],
                    // mount `rest` routes at this sub-path (/app/routes/rest.js)
                    routes: 'rest'
                },
                '/login': {
                    // define route (POST /api/login)
                    get: 'auth.login',
                    post: {
                        policies: [], // override the policy chain for this route
                        handler: 'auth.login' // define the handler (/app/controllers/auth.js#login)
                    }
                },
                '/logout': {
                    // define route (GET /api/logout)
                    get: 'auth.logout' // define the handler (/app/controllers/auth.js#logout)
                },
                '/permissions': {
                    options: {
                        model: 'permissions'
                    },
                    additionalPolicies: [
                        mycro.policies['member-of']('admins')
                    ],
                    // routes can be reused, while also changing the policy chain and request options
                    routes: 'rest'
                },
                '/public/logout': {
                    policies: [],
                    get: 'auth.logout'
                },
                '/say': {
                    get: 'greet',
                    '/hello/(\\w+)': {
                        regex: true,
                        get: 'greet.hello',
                        '/test': {
                            get: function(req, res) {
                                res.json(200, {message: 'test successful'});
                            },
                            '/(\\d+)': {
                                regex: true,
                                get: function(req, res) {
                                    res.json(200, {message: req.params[1]});
                                }
                            }
                        }
                    },
                    '/goodbye/(\\w+)': {
                        regex: true,
                        get: 'greet.goodbye'
                    }
                },
                '/test': 'test',
                '/test2': 'simple',
                '/test3': {
                    routes: 'simple'
                },
                '/users': {
                    options: {
                        model: 'users'
                    },
                    get: {
                        handler: 'rest.find'
                    },
                    post: 'rest.create',
                    '/:id': {
                        // define route (DELETE /api/users/:id)
                        del: {
                            // define additional policies to add to the policy chain for this route
                            additionalPolicies: [
                                mycro.policies['member-of']('admins')
                            ],
                            handler: 'rest.remove'
                        },
                        get: {
                            additionalPolicies: [
                                mycro.policies['or'](
                                    mycro.policies['is-equal']('user.id', 'params.id'),
                                    mycro.policies['able-to']('manage', 'users')
                                )
                            ],
                            handler: 'rest.detail'
                        },
                        put: {
                            additionalPolicies: [
                                mycro.policies['or'](
                                    mycro.policies['is-equal']('user.id', 'params.id'),
                                    mycro.policies['able-to']('manage', 'users')
                                ),
                                mycro.policies['if'](
                                    mycro.policies['not'](
                                        mycro.policies['able-to']('manage', 'users')
                                    ),
                                    mycro.policies['blacklist']('id', 'email', 'last', 'mobile'),
                                    mycro.policies['blacklist']('id')
                                )
                            ],
                            handler: 'rest.update'
                        }
                    }
                }
            },
            '/healthy': {
                // route handlers can be defined inline (policies too!)
                get: function(req, res) {
                    res.status(200);
                    res.send();
                }
            }
        },
        // mount `v2/routes` at a new version (/app/routes/v2/routes.js)
        'v2.0.0': 'v2/routes'
    };
};
