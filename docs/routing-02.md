## Routing (Part II)
The default routing hook allows you to define, overwrite, and add additional policies at any path, subpath, or individual route.

*/app/routes.js*
```javascript
module.exports = function(microservice) {
    return {
        '/api': {
            // define the policy chain for a particular path and all of it's subpaths and routes
            policies: [
                // all routes at /api/* will execute the `authenticate` policy, defined
                // at /app/policies/authenticated.js
                'authenticated'
            ],
            '/admin': {
                // define additional policies for routes at /api/admin/*. These policies will be
                // added to the current policy chain
                additionalPolicies: [
                    microservice.policies['or'](
                        'isSuperAdmin', // normal policies can be called via their file name
                        microservice.policies['member-of']('admins') // policy factory functions can be executed inline
                    )
                ],
                routes: 'admin'
            },
            '/blog': {
                // we can overwrite/redefine the current policies for a path, subpath, or
                // route by providing a `policies` attribute with a new definition
                policies: [],
                '/comments': {
                    options: {
                        model: 'blog/comments'
                    },
                    routes: 'crud'
                },
                '/posts': {
                    options: {
                        model: 'blog/posts'
                    },
                    routes: 'crud'
                }
            }
        }
    };
};
```
*/app/routes/crud.js*
```javascript
module.exports = {
    get: 'crud.find'
    post: {
        policies: [
            'authenticated'
        ],
        handler: 'crud.create'
    },
    '/:id': {
        del: {
            policies: [
                'authenticated',
                microservice.policies['or'](
                    'isSuperAdmin',
                    'owner'
                )
            ],
            handler: 'crud.destroy'
        },
        get: 'crud.findOne',
        put: {
            policies: [
                'authenticated',
                'owner'
            ],
            handler: 'crud.update'
        }
    }
}
```

In addition to policies, the api allows you to specify regex routes and version routes using `resitfy`'s versioning capabilities. See the `restify` docs for more info.


*/app/routes.js*
```javascript
module.exports = function(microservice) {
    return {
        // unversioned routes will use the default version specified in the server config
        // or 1.0.0 if no default is specified
        '/hello/(\\w+)': { // note the double \
            regex: true,
            get: 'greet.sayHello' //
        },
        'v2.0.0': {
            '/hello/(\\w+)': {
                regex: true,
                policies: [
                    'geo'
                ]
                get: 'greet.localizedGreeting'
            }
        }
    }
};
```
[Back to home](/README.md)
