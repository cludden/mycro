## Policies
Policies are simply middleware functions that are executed before the controller method. Each policy is capable of modifying the request, aborting it, or redirecting it. Policies are a perfect way of keeping authorization/access logic separate from endpoint logic.

For example, you might define an `authenticated` policy that looks for an access token on the request and attempts to verify it.


*/app/policies/authenticated.js*
```javascript
var jwt = require('jsonwebtoken'),
    SECRET = process.env['TOKEN_SECRET'];

module.exports = function(req, res, next) {
    // look for an `authorization` header on the request that contains a http bearer token
    if (!req.headers.authorization || !/^Bearer /g.test(req.headers.authorization)) {
        var e = 'Unauthenticated';
        res.json(401, {error: e});
        return next(e)
    }

    // attempt to verify the access token
    var token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, SECRET, function(err, payload) {
        if (err) {
            res.json(401, {error: err});
            return next(err);
        }
        req.user = payload.user;
        next();
    });
};
```

In addition, because the `mycro` instance can be passed as an argument to the route configuration, policies can be defined as factory functions that return standard policies, which allows you to configure and combine policies in numerous ways.  

In the example below we define an `or` policy, which accepts 1 or more policies as arguments, and passes if at least one policy calls `next()` with no error.


*/app/policies/or.js*
```javascript
var async = require('async'),
    _ = require('lodash');

module.exports = function() {
    var policies = Array.prototype.slice.call(arguments);
    return function(req, res, next) {
        // define a fake response object, in case child policies attempt to call
        // any response methods
        var fakeRes = {
            json: function() {},
            status: function() {
                return {
                    send: function() {}
                };
            }
        };

        async.some(policies, function(policy, fn) {
            if (_.isString(policy)) policy = req.mycro.policies[policy];
            if (!policy || !_.isFunction(policy)) return fn(false);
            policy(req, fakeRes, function(err) {
                fn(_.isEmpty(err));
            });
        }, function(ok) {
            if (!ok) {
                res.json(403, {error: 'all policies failed'});
                return next('all policies failed');
            }
            next();
        });
    };
};
```
[Back to home](/README.md)
