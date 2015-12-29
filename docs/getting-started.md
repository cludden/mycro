## Getting Started
### Models
Together, the `connections` hook and `models` hook provide a mechanism for your to integrate with your ORM of choice. These hooks are entirely optional, and you are free to define your own, or forego them entirely in favor of an alternative like the `DynamoDB` sdk. If you are using `MongoDB`, you can use the `restify-microservice-mongoose` adapter along with the `connections` and `models` hook to get off the ground and running.
```javascript
// in /config/connections.js
var adapter = require('restify-microservice-mongoose');

module.exports = {
    // define a connection
    mongodb: {
        adapter: adapter,
        host: 'localhost',
        port: 27017,
        user: '<username>',
        password: '<password>',
        database: '<database>'
    }
};

// in /config/models.js
module.exports = {
    // define the default connection to use for models
    connection: 'mongodb'
};

// in /app/models/users.js
module.exports = {
    schema: {
        first: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        last: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        hash: {
            type: String
        }
    }
};

// in /app/models/blog/posts.js
var mongoose = require('mongoose');

module.exports = {
    schema: {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }
};
```


### Services
Services hold logic that is used and reused throughout your application. They can be defined as plain old javascript objects or as a function that accepts the microservice instance, which allows you to utilize services within one another.
```javascript
// in /app/services/email.js
var AWS = require('aws-sdk'),
    ses = new AWS.SES({
        region: 'us-west-2'
    });

module.exports = {
    sendEmail: function(options, cb) {
        ses.sendEmail(options, cb);
    }
}

// in /app/services/error.js
var bugsnag = require('bugsnag');

module.exports = function(microservice) {
    return {
        notify: function(err) {
            microservice.log('error', err);
            microservice.services['email'].sendEmail({}, function() {});
            bugsnag.notify(err);
        }
    };
}
```  

Additionally, services can be grouped into sub-folders within the `/app/services` folder for organization. These nested services can be accessed via their full path (ie `microservice.services['format/number']`)
```javascript
// in /app/services/format/number.js
var numeral = require('numeral');

module.exports = {
    accounting: function(number) {
        return numeral(number).format('(0,0.00) $');
    },
    currency: function(number) {
        return numeral(number).format('$0,0.00');
    }
}

// in /app/services/format/date.js
var moment = require('moment');

module.exports = {
    friendly: function(date) {
        return moment(date).format('DDDDD');
    },
    standard: function(number) {
        return nmoment(date).format('MM/DD/YYYY');
    }
}
```


### Controllers
Controllers hold all of your endpoint-specific logic and behave in a manner very similar to `sails.js`. All controllers live in the `/app/controllers` folder.  

A very simple controller:
```javascript
// in /app/controllers/greet.js
module.exports = {
    sayHello: function(req, res) {
        res.json(200, {message: 'Hello World!'});
    }
}
```

Similar to services, controllers can also be grouped in sub-folders within the `/app/controllers` folder. Controllers can access models and services by accessing the microservice instance at `req.microservice`
```javascript
// in /app/controllers/blog/posts.js
module.exports = {
    create: function(req, res) {
        var microservice = req.microservice;
        microservice.models['blog/posts'].create(req.body, function(err, post) {
            if (err) return res.json(500, {error: err});
            res.json(200, {data: post});
        });
    },
    destroy: function(req, res) { /* destroy logic */ }
}

// in /app/controllers/blog/comments.js
module.exports = {
    create: function(req, res) { /* create login */ },
    destroy: function(req, res) { /* destroy logic */ }
}
```

### Routing (Part I)
`restify-microservice`'s default routing hook provides a flexible and powerful routing mechanism for `restify` apps. The main routing configuration is defined in `/app/routes.js`. An extremely simple routing configuration can be seen below.
```javascript
// in /app/routes.js
module.exports = function(microservice) {
    return {
        '/greet': {
            get: 'greet.sayHello'
        },
        '/blog': {
            '/comments': {
                post: 'blog/posts.create',
                '/:id': {
                    del: 'blog/posts.destroy'
                }
            },
            '/posts': {
                post: 'blog/posts.create',
                '/:id': {
                    del: 'blog/posts.destroy'
                }
            }
        }
    };
};
```
The routing configuration shown above defines the following routes
- GET /greet => handled by the *sayHello* method on the *greet* controller
- POST /blog/comments => handled by the *create* method on the *blog/comments* controller
- DELETE /blog/comments/:id => handled by the *destroy* method on the *blog/comments* controller
- POST /blog/posts => handled by the *create* method on the *blog/posts* controller
- DELETE /blog/posts/:id => handled by the *destroy* method on the *blog/posts* controller  
The default routing hook provides a ton of functionality that we haven't covered yet, but before we do, let's take a look at policies.


### Policies
Policies are simply middleware functions that are executed before the controller method. Each policy is capable of modifying the request, aborting it, or redirecting it. Policies are a perfect way of keeping authorization/access logic separate from endpoint logic.
```javascript
// in /app/policies/authenticated.js
module.exports = function(req, res, next) {
    if (!req.user) {
        res.json(401, {error: 'unauthenticated'});
        next('unauthenticated');
    }
    next();
}
```
In addition, because the microservice instance can be passed as an argument to the route configuration, policies can be defined as factory functions that return standard policies, which allows you to configure and combine policies in an unlimited fashion.  

In the example below we define an `or` policy, which accepts 1 or more policies as arguments, and passes if at least one policy calls `next()` with no error.
```javascript
// in /app/policies/or.js
var asyncjs = require('async'),
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

        asyncjs.some(policies, function(policy, fn) {
            if (_.isString(policy)) policy = req.microservice.policies[policy];
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

### Routing (Part II)
The default routing hook allows you to define, overwrite, and augment policies at any path, subpath, or individual route.
```javascript
// in /app/routes.js
module.exports = function(microservice) {
    return {
        '/api': {
            policies: [
                'authenticated' // all routes at /api/* will execute this policy
            ],
            '/admin': {
                // define additional policies for routes at /api/admin/*
                additionalPolicies: [
                    microservice.policies['member-of']('admins')
                ]
            }
        }
    };
};
```
