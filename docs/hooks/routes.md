# hooks/routes.js
The `routes` is responsible for binding routes based on a config file. The hook must be run after the
`server`, `policies`, and `controllers` hooks.

```javascript
// in /app/routes.js

module.exports = function(microservice) {
    return {
        middleware: [ // default middleware (policies) applied to all routes unless overridden
            'authenticated' // defined in /app/policies/authenticated.js
        ],

        '/greet/:name': {
            'get': 'greet.sayHello' // defined in /app/controllers/greet.js#sayHello()
        },

        '\/greet\/(\d+)': {
            regex: true, // interpret the route as regex
            'get': 'greet.sayHelloToRobot'
        },

        '/users': {
            middleware: [ // define middleware for this path, overrides default middleware
                'authenticated',
                'isAdmin'
            ],
            'get': 'users.find',
            'post': 'users.create'
        },

        '/users/:id': {
            middleware: [
                'authenticated',
                'isAdmin'
            ],
            'del': [ // define middleware for a specific http method, overrides default middleware
                'authenticated',
                microservice.policies['can']('destroy', 'users'),
                'users.destroy'
            ],
            'get': 'users.findOne',
            'put': 'users.update'
        },

        '2.0.0': { // define new version
            middleware: [
                'authenticated',
                'newPolicy'
            ],

            '/greet/:name': {
                'get': 'greet.sayHelloV2'
            }
        }
    };
};
```
