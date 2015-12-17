# hooks/policies.js
The `policies` hook will automatically load all policies defined in the `/app/policies` directory.  

A normal policy is simply a express.js/restify.js middleware function. These can be used in the `routes.js` files using their filenames (string).
```javascript
// in app/policies/authenticated.js

module.exports = function(req, res, next) {
    if (!req.user) {
        return res.json(403, {error: 'Forbidden'});
    }
    next();
};


// ...
// in app/routes.js

module.exports = {
    '/account/balance': {
        get: [
            'authenticated',
            'account.balance'
        ]
    };
};
```

Alternatively, policies can defined as factory functions. This allows you to configure policies and reuse code logic.  
```javascript
// in app/policies/can.js

module.exports = function(permission, model) {
    return function(req, res, next) {
        req.microservice.models['permissions'].findOne({
            name: permission,
            model: model,
            users: req.user.id
        }, function(err, permission) {
            if (err) return res.json(500, {error: err});
            if (!permission) return res.json(403, {error: 'You do not have permission to perform this action'});
            next();
        });
    };
};


// ...
// in app/routes.js

module.exports = function(microservice) {
    return {
        '/users/:id/approve': {
            get: [
                'authenticated',
                microservice.policies['can']('approve', 'users'),
                'users.approve'
            ]
        },

        '/users/:id/delete': {
            get: [
                'authenticated',
                microservice.policies['can']('delete', 'users'),
                'users.approve'
            ]
        }
    };
};
```
