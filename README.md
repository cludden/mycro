# restify-microservice
a [restify.js](http://restify.com) based microservice library, inspired by [sails.js](http://sailsjs.org)

## Install
```javascript
npm install --save restify-microservice
```

## Purpose
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) app, using `hooks`. By default, `restify-microservice` comes bundled with hooks for middleware, models, policies, routing, services, etc. However, this module allows you to implement custom hooks extremely easily, as well as disable, override, or reorder the default hooks. More importantly, this module makes no assumption regarding which other third party ORMs or other libraries you'd like to use in your app. In fact, using restify is entirely optional, and can be disabled by excluding the `server` hook or implementing your own

## Project Structure
A typical `restify-microservice` project structure:
- **my-project/**
    - **app/**
      - **controllers/**
      - **models/**
      - **policies/**
      - **services/**
    - **config/**
    - **hooks/**
    - index.js


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

## Bundled Hooks
*more documentation coming soon*

`restify-microservice` comes bundled with the following hooks:
- connections
- models
- server
- [services](docs/hooks/services.md)
- policies
- controllers
- routes  

The default hooks configuration is shown below. You can override this by providing your own configuration in `config/hooks.js`. A quick note, bundled hooks can be referenced by name (as strings), custom hooks or installable hooks must be `require`'ed.
```javascript
// default hook configuration

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
```javascript
// in config/hooks.js

module.exports = [
    'server',
    'services',
    require('../hooks/my-hook.js'), // custom project hook
    'controllers',
    require('super-cool-hook'), // installable hook
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

## Testing
`npm test`

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
