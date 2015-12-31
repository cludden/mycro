# restify-microservice
[![Build Status](https://travis-ci.org/cludden/restify-microservice.svg?branch=master)](https://travis-ci.org/cludden/restify-microservice)
a [restify.js](http://restify.com) based microservice library, inspired by [sails.js](http://sailsjs.org)  


## Install
```javascript
npm install --save restify-microservice
```


## Purpose
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) app, using `hooks`. By default, `restify-microservice` comes bundled with hooks for middleware, models, policies, routing, services, etc. However, this module allows you to implement custom hooks extremely easily, as well as disable, override, or reorder the default hooks. More importantly, this module makes no assumption regarding which other third party libraries (ORMs, middleware, templating engines, etc) you'd like to use in your app. In fact, using restify is entirely optional, and can be disabled by excluding the `server` hook or implementing your own


## Docs
1. [Getting Started](/docs/getting-started.md)
2. [Controllers](/docs/controllers.md)
3. [Services](/docs/services.md)
4. [Routing (Part I)](/docs/routing-01.md)
5. [Policies](/docs/policies.md)
6. [Routing (Part II)](/docs/routing-02.md)
7. [Models and Connections](/docs/models-and-connections.md)

## Configuration
8. [Server & Middleware](/docs/middleware.md)
9. [Logging](/docs/logging.md)

## Bundled Hooks
`restify-microservice` comes bundled with the following hooks:
- connections
- models
- server
- services
- policies
- controllers
- routes


The default hooks configuration is shown below. You can override this by providing your own configuration in `config/hooks.js`.
```javascript
module.exports = [
    'connections',
    'models',
    'server',
    'services',
    'policies',
    'controllers',
    'routes'
];
```

To implement your own hook configuration, define your own `config/hooks.js` file:


*config/hooks.js*
```javascript
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


*hooks/my-hook.js*
```javascript
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
};
```


## Installable Hooks & Adapters
To use these hooks, simply install them via `npm install --save <insert hook name here>` and require them in your `config/hooks.js` file.
- [restify-microservice-mongoose](https://github.com/cludden/restify-microservice-mongoose)
    - mongoose adapter
- [restify-microservice-mongoose-rest](https://github.com/cludden/restify-microservice-mongoose-rest)
    - Creates restful mongoose controllers for your mongoose models using [restify-mongoose](https://github.com/saintedlama/restify-mongoose)


## Testing
run all tests  
```javascript
npm test
```

run coverage
```javascript
grunt coverage
```


## Contributing
1. [Fork it](https://github.com/cludden/restify-microservice/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License
Copyright (c) 2015 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).
