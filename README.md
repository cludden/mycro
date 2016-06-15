# mycro
[![Build Status](https://travis-ci.org/cludden/mycro.svg?branch=master)](https://travis-ci.org/cludden/mycro) [![Codacy Badge](https://api.codacy.com/project/badge/grade/5b759953fe0248b1a241bc8700f64e61)](https://www.codacy.com/app/chris-ludden/mycro)


a [restify.js](http://restify.com) based microservice library, inspired by [sails.js](http://sailsjs.org)  


## Install
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
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) or [express.js](http://expressjs.com) app, using `hooks`. By default, `mycro` comes bundled with hooks for controllers, models & connections, middleware, policies, routing, services, etc. However, this module allows you to implement custom hooks extremely easily, as well as disable, override, or reorder the default hooks. More importantly, this module makes no assumption regarding which other third party libraries (ORMs, middleware, templating engines, etc) you'd like to use in your app. In fact, using `restify` is entirely optional, and can be disabled by excluding the `server` & `start` hooks or implementing your own.


## Docs
1. [Getting Started](/docs/getting-started.md)
2. [Controllers](/docs/controllers.md)
3. [Services](/docs/services.md)
4. [Routing (Part I)](/docs/routing-01.md)
5. [Policies](/docs/policies.md)
6. [Routing (Part II)](/docs/routing-02.md)
7. [Models and Connections](/docs/models-and-connections.md)


## Configuration
- [Server & Middleware](/docs/middleware.md)
- [Logging](/docs/logging.md)


## Hooks
At the most basic level, `mycro` is simply a serial asynchronous hook loader. By default, it comes bundled with hooks for implementing some of the most common patterns found in most `restify` apps, but you are free to include or exclude any or all of the included hooks, as well as write your own. Hooks can do anything you need them to, including but not limited to, interacting with a database, making api calls, loading third party modules, etc.

## Bundled Hooks
`mycro` comes bundled with the following hooks:
- **server** - creates a restify server and loads specified middleware
- **connections** - handles all database/ORM connection configuration
- **models** - loads models at `mycro.models` and executes any post processing
- **services** - loads services at `mycro.services`
- **policies** - loads policies at `mycro.policies`
- **controllers** - loads controllers at `mycro.controllers`
- **routes** - defines routes based on the route config specified in `/app/routes.js`
- **start** - starts the server


To implement your own hook configuration, define your own `config/hooks.js` file:


*config/hooks.js*
```javascript
module.exports = [
    'server',
    'connections',
    'models',
    'services',
    'policies',
    require('../hooks/my-hook.js'), // custom project hook
    'controllers',
    'super-cool-hook', // installable hook
    require('../hooks/my-own-routes-hook'), // custom project hook
    'start'
];
```


## Custom Hooks
Implementing a custom hook is super easy. A hook exports a function. The function is bound to the `mycro` application instance, which allows you to manipulate any aspect of the `mycro` application. Lastly, the function accepts a single callback. Make sure to call it when the hook is complete!


*hooks/my-hook.js*
```javascript
module.exports = function myHook(done) {
    var mycro = this;
    // do some stuff
    done();
};
```


## Installable Hooks & Adapters
**Hooks**


To use these hooks, simply install them via `npm install --save <insert hook name here>` and require them in your `config/hooks.js` file.


- [mycro-error](https://github.com/cludden/mycro-error)
    - Installs an error service that provides common error handling implementations
- [mycro-json-api-ify](https://github.com/kutlerskaggs/mycro-json-api-ify)
    - Installs a json service that exports a [json-api-ify] serializer
- [mycro-mongoose-rest](https://github.com/cludden/mycro-mongoose-rest)
    - Creates RESTful mongoose controllers for your mongoose models using [restify-mongoose](https://github.com/saintedlama/restify-mongoose)
- [mycro-secrets](https://github.com/cludden/mycro-secrets)
    - A secret management hook (using [vault](https://www.vaultproject.io)) for mycro apps
- [mycro-util-policies](https://github.com/kutllerskaggs/mycro-util-policies)
    - Installs utility polices (if, or, not, validate) for mycro apps


**Adapters**


- [mycro-mongoose](https://github.com/cludden/mycro-mongoose)
    - mongoose (MongoDB) adapter
- [mycro-sequelize](https://github.com/cludden/mycro-sequelize)
    - sequelize (PostgreSQL, MySQL, MSSQL, SQLite) adapter
- [mycro-vogels](https://github.com/cludden/mycro-vogels)
    - vogels (DynamoDB) adapter.


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
1. [Fork it](https://github.com/cludden/mycro/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License
Copyright (c) 2016 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).
