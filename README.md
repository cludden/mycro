# mycro
[![Build Status](https://travis-ci.org/cludden/mycro.svg?branch=master)](https://travis-ci.org/cludden/mycro) [![Codacy Badge](https://api.codacy.com/project/badge/grade/5b759953fe0248b1a241bc8700f64e61)](https://www.codacy.com/app/chris-ludden/mycro)


a hook based library, inspired by [sails.js](http://sailsjs.org), for providing a highly customizable platform for a well-organized [restify.js](http://restify.com) or [express.js](http://expressjs.com) app.


## Installing
With yeoman:
```javascript
// install yeoman & the mycro generator globablly
npm install -g yo generator-mycro

// create a new mycro app
yo mycro my-app
```

The long way:
```javascript
npm install --save mycro
```



## Purpose
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) or [express.js](http://expressjs.com) app, using `hooks`. By default, `mycro` comes bundled with hooks for controllers, models & connections, middleware, policies, routing, services, etc. However, this module allows you to implement custom hooks extremely easily, as well as disable, override, or reorder the default hooks. More importantly, this module makes no assumption regarding which other third party libraries (ORMs, middleware, templating engines, etc) you'd like to use in your app.



## Getting Started
The easiest way to get started is to use [yeoman](http://yeoman.io) to generate a new `mycro` project.

make sure you have yeoman and the generator installed globally
```bash
npm install -g yo generator-mycro
```

create a new project
```bash
yo mycro my-new-project
```

lastly, switch into your new project directory and start the app
```bash
cd my-new-project
npm test
```

Or, the long way.

make a new project folder, change into it, and initialize a new npm project
```bash
mkdir my-new-project && cd my-new-project && npm init
```

install mycro
```bash
npm install --save mycro
```

create a new app.
```javascript
// in /lib/app.js
import Mycro from 'mycro';

const mycro = new Mycro();
export default mycro;
```



## Project Structure
a typical project will look like the following:
- **/my-new-project**
    - **/dist**
    - **/lib**
        - **/config**
        - **/connections**
        - **/controllers**
        - **/hooks**
        - **/models**
        - **/policies**
        - **/routes**
        - **/services**
        - app.js - *instantiate app here, allows easy importing in tests*
        - index.js - *start app here*
    - **/test**
    - package.json



## Configuration
Hook configuration files live in the `/lib/config` directory. See hook repos for hook specific configuration.



## Connections
Mycro relies on the concept of *adapters* to implement `models` and `connections`. Think of adapters as super lightweight files that sit between `mycro` and an orm/database client. Most orm/clients rely on connecting to a database. These connection files live here. Adapters can define their own specifications for what a connection file should look like. An example connection file for `mongoose` using [mycro-mongoose](https://github.com/cludden/mycro-mongoose) is shown below.
```javascript
// in /lib/connections/mongo.js

import adapter from 'mycro-mongoose';

export default {
    adapter,
    config: {
        url: 'mongodb://<username>:<password>@localhost:27017/my-database'
    },
    models: [
        'user',
        'post'
    ]
}
```



## Models
Similar to connections, adapters can implement their own model specification. An example model file for `mongoose` using the adapter above is shown below.
```javascript
// in /lib/models/user.js

export default function(connection, Schema) {
    const schema = new Schema({
        first: String,
        last: String,
        email: String,
    }, {
        collection: 'users',
        strict: false
    });

    schema.virtual('fullName')
    .get(function() {
        return `${this.first} ${this.last}`;
    });

    return connection.model('user', schema);
}
```



## Controllers
Controllers hold all of your endpoint-specific logic and behave in a manner very similar to sails. Controllers can export a single endpoint, or multiple endpoints. They can also be organized into subdirectories for better organization. Mycro encourages the same "thin" controller philosophy as sails. For more info, see the discussion on the benefits of "thin" controllers [here](http://sailsjs.org/documentation/concepts/controllers).
```javascript
// in /lib/controllers/users/create.js

export default function(mycro) {
    return function createUser(req, res, next) {
        const Users = mycro.models.user;
        Users.create(req.body)
        .then(function(user) {
            res.status(200).json({ user })
        })
        .catch(next);
    }
}
```



## Services
Services are meant to hold the bulk of the logic used throughout your application. Ideally, nearly all of your business logic will live in services; controllers should be simple orchestration functions that compose service & model functions together. That said, services can be whatever you want them to be. By default, services can be accessed at `mycro.services.servicename` or `mycro.services['path/to/service']`. See some examples below.
```javascript
// in /lib/services/api.js

import axios from 'axios';
import boom from 'boom';

export default function(mycro) {
    const client = axios.create({
        baseURL: 'https://api.example.com'
    });

    client.interceptors.response.use(function(res) {
        return res;
    }, function(res) {
        const e = boom.create(res.status, res.data || res.message);
        return Promise.reject(e);
    });

    return client;
}
```

```javascript
// in /lib/services/email.js

import mandrill from 'mandrill-api/mandrill';
import _ from 'lodash';

export default function(mycro) {
    const client = new mandrill.Mandrill('<api-key>');

    const defaults = { /* .. */ };

    return {
        sendTemplate(options, done) {
            _.defaults(options, defaults);
            client.messages.sendTemplate(options, done);
        }
    }
}
```



## Middleware/Policies
Policies are simply middleware functions that are executed before the controller method. Each policy is capable of modifying the request, aborting it, or redirecting it. Policies are a perfect way of keeping authorization/access logic separate from endpoint logic. By default, policies can be accessed at `mycro.policies.policyname` or `mycro.policies['path/to/policy']`.

For example, you might define an `authenticate` policy that looks for an access token on the request and attempts to verify it. Or a `validate` policy that validates a request payload and applies defaults before passing control to the controller. Where `mycro` policies really differ from sails is that they can also export factory functions that return policy functions, which allows you to configure and compose policies in numerous ways.

```javascript
// in /lib/policies/authenticate.js
import boom from 'boom';

export default function(mycro) {
    return createPolicy(options) {
        return authenticate(req, res, next) {
            const Jwt = mycro.services.jwt;

            const token = req.headers.authorization;
            if (!/^Bearer /g.test(token)) {
                if (options.anonymous === true) {
                    return next();
                }
                return next(boom.unauthorized());
            }

            Jwt.verifyToken(token)
            .then(function(payload) {
                req.decoded = payload;
                next();
            })
            .catch(function(err) {
                err = boom.wrap(err, 403);
                next(err);
            });
        }
    }
}
```

In the example below we define a `some` policy, which accepts 1 or more policies as arguments, and passes if at least one policy calls `next()` with no error.

```javascript
import async from 'async';
import boom from 'boom';
import httpMocks from 'node-mocks-http';

export default function(mycro) {
    return function createPolicy(...policies) {
        return function some(req, res, next) {
            const errors = [];
            async.some(policies, function(policy, done) {
                const mockRes = httpMocks.createResponse();
                policy(req, mockRes, function(err) {
                    if (err) {
                        errors.push(err);
                        return done(null, false);
                    }
                    if (err === false) {
                        err = boom.create(mockRes.statusCode);
                        errors.push(err);
                        return done(null, false);
                    }
                    done(null, true);
                });
            }, function(err, result) {
                if (result === false) {
                    const payload = Json.serializeError(errors);
                    const status = fp.get('meta.status', payload);
                    res.status(status).json(payload);
                    return next(false);
                }
                next();
            })
        }
    }
}
```



## Routing
*Note: routing has changed slightly in v1*


Mycro's default routing hook provides a flexible and powerful routing mechanism for restify or express apps.
```javascript
// in /lib/routes/index.js

export default function(mycro) {
    const policies = mycro.policies;

    return {
        '/api': {
            policies: [
                policies.authenticate({ anonymous: true })
            ]
            '/posts': {
                route(router) {
                    router.get('posts/query'),
                    router.post('posts/create')
                },
                '/:post_id': {
                    route(router) {
                        router.get('posts/detail')
                    }
                }
            },
            '/users': {
                route(router) {
                    router.get('users/query');
                    router.post(
                        policies.validate()
                        'users/create'
                    );
                },
                '/:user_id': {
                    route(router, newRouter) {
                        newRouter.delete(
                            policies.authenticate({ anonymous: false })
                            policies.not(
                                policies.isEqual('params.user_id', 'payload.uid')
                            ),
                            policies.hasRole('admin', 'user-admin'),
                            'users/remove'
                        );
                        router.get('users/detail');
                        router.patch('users/update');
                    }
                }
            }
        },
        '/health': {
            route(router) {
                router.get(function(req, res) {
                    res.status(200).json({ status: 'healthy'})
                })
            }
        }
    }
}
```



## Hooks
At the most basic level, `mycro` is simply a serial asynchronous hook loader. By default, it comes bundled with hooks for implementing some of the most common patterns found in most `restify` or `express` apps, but you are free to include or exclude any or all of the included hooks, as well as write your own. Hooks can do anything you need them to, including but not limited to, interacting with a database, making api calls, loading third party modules, etc.


To implement your own hook configuration, define your own `config/hooks.js` file:
```javascript
// in /lib/config/hooks.js

import myHook from '../hooks/my-hook';
import myCustomRoutingHook from '../hooks/my-custom-routing-hook';

export default [
    'server',
    'connections',
    'models',
    'services',
    'policies',
    myHook,
    'controllers',
    'super-cool-hook', // installable hook
    myCustomRoutingHook,
    'start'
];
```



## Installable Hooks & Adapters
**Hooks**


To use these hooks, simply install them via `npm install --save <insert hook name here>` and require them in your `/config/hooks.js` file.


- [mycro-error](https://github.com/cludden/mycro-error) - common error utility functions for RESTful apis
- [mycro-secrets](https://github.com/cludden/mycro-secrets) - a configuration and secret management hook (using [vault](https://www.vaultproject.io))


**Adapters**


- [mycro-mongoose](https://github.com/cludden/mycro-mongoose) - mongoose (MongoDB) adapter
- [mycro-sequelize](https://github.com/cludden/mycro-sequelize) - sequelize (MySQL, PostgreSQL, MSSQL, MariaDB, SQLite) adapter
- [mycro-vogels](https://github.com/cludden/mycro-vogels) - vogels (DynamoDB) adapter



## Testing
run all tests  
```bash
npm test
```

run coverage
```bash
npm run coverage
```



## Contributing
1. [Fork it](https://github.com/cludden/mycro/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request



## License
Copyright (c) 2016 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).
