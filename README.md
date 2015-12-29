# restify-microservice
a [restify.js](http://restify.com) based microservice library, inspired by [sails.js](http://sailsjs.org)  

*Note: this is still a work in progress. There may be bugs in the code, and the api is subject to change. Also, better docs and more tests are coming. In the meantime, check out the dummy app in the /test directory*


## Install
```javascript
npm install --save restify-microservice
```


## Purpose
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) app, using `hooks`. By default, `restify-microservice` comes bundled with hooks for middleware, models, policies, routing, services, etc. However, this module allows you to implement custom hooks extremely easily, as well as disable, override, or reorder the default hooks. More importantly, this module makes no assumption regarding which other third party libraries (ORMs, middleware, templating engines, etc) you'd like to use in your app. In fact, using restify is entirely optional, and can be disabled by excluding the `server` hook or implementing your own


## Getting Started
```javascript
// in index.js

var Microservice = require('restify-microservice'),
    microservice = new Microservice();

microservice.start(function(err) {
    if (err) {
        return microservice.log('error', err);
    }
    microservice.log('info', 'microservice started successfully');
});
```


## Project Structure
A typical `restify-microservice` project structure:
- **my-project/**
    - **app/**
      - **controllers/**
      - **models/**
      - **policies/**
      - **routes/**
      - **services/**
    - **config/**
    - **hooks/**
    - index.js


## Controllers
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

Controllers can also be grouped in sub-folders within the `/app/controllers` folders, and are able to access models and services by referencing the appropriate containers on the microservice instance, which is available in all controller methods via the *Request* object (`req.microservice`)
```javascript
// in /app/controllers/blog/posts.js
module.exports = {
    create: function(req, res) {
        var microservice = req.microservice;
        async.auto({
            post: function createPost(next) {
                microservice.models['blog/posts'].create(req.body, next);
            },

            notify: ['post', function notifyAuthor(next, results) {
                microservice.services['email'].sendEmail({
                    to: results.post.author.email
                }, next);
            }]
        }, function(err, results) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, {data: results.post});
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
                get: 'blog/comments.find'
                post: 'blog/comments.create',
                '/:id': {
                    del: 'blog/comments.destroy',
                    get: 'blog/comments.findOne',
                    put: 'blog/comments.update'
                }
            },
            '/posts': {
                get: 'blog/posts.find'
                post: 'blog/posts.create',
                '/:id': {
                    del: 'blog/posts.destroy',
                    get: 'blog/posts.findOne',
                    put: 'blog/posts.update'
                }
            }
        }
    };
};
```
The routing configuration shown above defines the following routes
- `GET /greet` => handled by the *sayHello* method on the *greet* controller
- `GET /blog/comments` => handled by the *find* method on the *blog/comments* controller
- `POST /blog/comments` => handled by the *create* method on the *blog/comments* controller
- `DELETE /blog/comments/:id` => handled by the *destroy* method on the *blog/comments* controller
- `GET /blog/comments/:id` => handled by the *findOne* method on the *blog/comments* controller
- `PUT /blog/comments/:id` => handled by the *update* method on the *blog/comments* controller
- `GET /blog/posts` => handled by the *find* method on the *blog/posts* controller
- `POST /blog/posts` => handled by the *create* method on the *blog/posts* controller
- `DELETE /blog/posts/:id` => handled by the *destroy* method on the *blog/posts* controller  
- `GET /blog/posts/:id` => handled by the *findOne* method on the *blog/posts* controller
- `PUT /blog/posts/:id` => handled by the *update* method on the *blog/posts* controller  

The default routing hook also allows you to include external route configurations and mount them at a given path, which allows you to separate your route configuration into multiple smaller configurations.  

For example, you could create an `/app/routes/admin.js` file to hold all of your admin related endpoint configurations:
```javascript
// in /app/routes/admin.js
module.exports = {
    '/groups': {
        // ...
    }
    '/permissions': {
        // ...
    },
    '/users': {
        // ...
    }
}
```

and then mount it at `/admin` like so:
```javascript
// in /app/routes.js
module.exports = function(microservice) {
    return {
        '/admin': 'admin' // inline definition

        // or, if you want to specify some default options/policies for the entire /admin/* path
        '/admin': {
            policies: [ /* ... */ ],
            routes: 'admin'
        }
    };
};
```

Route inclusion also allows you to reuse routes in a manner similar to sails blueprints. For example, instead of redefining the common `CRUD` functionality in two separate controllers, and then defining two sets of `CRUD` endpoints that really only differ in the `model` they point to, we could instead define a single crud controller and a single crud route configuration and mount it at various endpoints.


A very simple crud controller outline, that looks for a model to use in the *Request* options.
```javascript
// in /app/controllers/crud.js
module.exports = {
    destroy: function(req, res) { /* ... */ },

    destroy: function(req, res) { /* ... */ },

    find: function(req, res) {
        var modelName = req.options.model,
            Model = req.microservice.models[modelName];

        if(!Model) return res.json(400, {error: 'Invalid model specified: ' + modelName});

        var criteria = req.microservice.services['crud'].parseCriteriaFromRequest(req);

        Model.find(criteria, function(err, results) {
            if (err) return res.json(500, {error: err});
            res.json(200, {data: results});
        });
    },

    findOne: function(req, res) { /* ... */ },

    update: function(req, res) { /* ... */ },
};
```

Now define a reusable route configuration
```javascript
// in /app/routes/crud.js
module.exports = {
    get: 'crud.find'
    post: 'crud.create',
    '/:id': {
        del: 'crud.destroy',
        get: 'crud.findOne',
        put: 'crud.update'
    }
}
```

Lastly, we can now mount the `CRUD` routes at various endpoints throughout our app.
```javascript
// in /app/routes.js
module.exports = function(microservice) {
    return {
        '/greet': {
            get: 'greet.sayHello'
        },
        '/blog': {
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
    };
};
```

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
                    microservice.policies['or'](
                        microservice.policies['member-of']('admins')
                        microservice.policies['able-to'](['read', 'write'], 'blog/posts')
                    )
                ]
            },
            '/blog': {

            }
        }
    };
};
```


## Bundled Hooks
*more documentation coming soon*

`restify-microservice` comes bundled with the following hooks:
- connections
- models
- server
- [services](docs/hooks/services.md)
- [policies](docs/hooks/policies.md)
- controllers
- [routes](docs/hooks/routes.md)  

The default hooks configuration is shown below. You can override this by providing your own configuration in `config/hooks.js`.
```javascript
// default hook configuration

module.exports = [
    'server',
    'connections',
    'models',
    'services',
    'policies',
    'controllers',
    'routes'
];
```

To implement your own hook configuration, define your own `config/hooks.js` file:
```javascript
// in config/hooks.js

module.exports = [
    'server',
    'services',
    require('../hooks/my-hook.js'), // custom project hook
    'controllers',
    'super-cool-hook', // installable hook
    require('../hooks/my-own-routes-hook') // custom project hook
];
```


## Custom Hooks
Implementing a custom hook is as easy as requiring a file/module that exports a function that accepts a single callback. The function is bound to the `microservice` context, which allows you to manipulate any aspect of the `microservice`.
```javascript
// in hooks/my-hook.js

module.exports = function(done) {
    var microservice = this;

    // this assumes that the `services` hook was run prior to this hook and that
    // we implemented a service `app/services/dynamoDB.js` that exports a dynamoDB
    // document client
    microservice.services['dynamoDB'].put({
        TableName: 'service-logs',
        Item: {
            'service': 'my-service',
            'event': 'starting',
            'info': {
                'date': Date.now()
            }
        }
    }, function(err, data) {
        if (err) {
            microservice.log('error', err);
            return done(err);
        }
        done();
    });
}
```


## Configuration
`restify-microservice` assumes some basic configuration, outlined below. You can override this configuration by creating the appropriate config file in your `config/` folder.  

*more docs coming soon*


## Installable Hooks
To use these hooks, simply install them via `npm install --save <insert hook name here>` and require them in your `config/hooks.js` file.
- [restify-microservice-mongoose](https://github.com/cludden/restify-microservice-mongoose)
    - Auto compile mongoose models and make them available at `microservice.models`
- [restify-microservice-mongoose-rest](https://github.com/cludden/restify-microservice-mongoose-rest)
    - Creates restful mongoose controllers for your mongoose models using [restify-mongoose](https://github.com/saintedlama/restify-mongoose)


## Controllers
Controllers hold all endpoint-specific logic. They represent the final handler for any given route.
```javascript
// in app/controllers/greet.js

module.exports = {
    /**
     * Say hello
     * @param  {Request} req
     * @param  {Response} res
     */
    hello: function(req, res) {
        var name = req.params.name || 'World';
        res.json(200, {message: 'Hello ' + name+ '!'});
    },

    /**
     * Say goodbye
     * @param  {Request} req
     * @param  {Response} res
     */
    goodbye: function(req, res) {
        var name = req.params.name || 'World';
        res.json(200, {message: 'Goodbye ' + name+ '!'});
    }
};
```
Controllers can also be grouped/nested.
```javascript
// in app/controllers/blog/posts.js

module.exports = {
    /**
     * Create a blog post
     * @param  {Request} req
     * @param  {Response} res
     */
    create: function(req, res) {
        var microservice = req.microservice;
        // assuming we've loaded the connections, models, and
        // restify-microservice-mongoose hooks
        microservice.models['blog/post'].insert({
            title: 'My Post',
            body: 'My first blog post',
            author: req.user.id
        }, function(err, post) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, {data: post});
        });
    },

    /**
     * Remove a blog post
     * @param  {Request} req
     * @param  {Response} res
     */
    remove: function(req, res) {
        var microservice = req.microservice;
        // assuming we've loaded the connections, models, and
        // restify-microservice-mongoose hooks
        microservice.models['blog/post'].remove({
            id: req.params.id
        }, function(err) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, {message: 'blog post removed');
        });
    }
};

// in app/controllers/blog/comments.js

module.exports = {
    /**
     * Add a comment to a blog post
     * @param  {Request} req
     * @param  {Response} res
     */
    add: function(req, res) {
        // do some stuff here
    },

    /**
     * Update a comment
     * @param  {Request} req
     * @param  {Response} res
     */
    update: function(req, res) {
        // do some stuff here
    }
};
```

## Routing (part 1)
Once we've defined some controllers, we can start to define our routes.
```javascript
// in app/routes.js

module.exports = function(microservice) {
    return {
        '/blog': {
            '/posts': {
                get: 'blog/posts.create', // GET /blog/posts
                '/:id': {
                    del: 'blog/posts.remove' // DELETE /blog/posts/:id
                }
            },
            '/comments': {
                post: 'blog/comments.add', // POST /blog/comments
                put: 'blog/comments.update' // PUT /blog/comments
            }
        },
        '/hello/:name': {
            get: 'greet.hello'
        },
        '/goodbye/:name': {
            get: 'greet.goodbye'
        }
    };
};
```

## Testing
run all tests  
```javascript
npm test
```

run coverage
```javascript
grunt coverage
```


## To Do
- [ ] documentation
- [ ] tests


## Contributing
1. [Fork it](https://github.com/cludden/restify-microservice/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License
Copyright (c) 2015 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).
