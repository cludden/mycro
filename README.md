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
To provide a highly customizable platform for a well-organized [restify.js](http://restify.com) or [express.js](http://expressjs.com) app, using `hooks`. As of version 1+, `mycro` no longer comes bundled with default hooks. All of the previous default hooks for controllers, connections, models, middleware, routing, and services have been extracted out into separate installable hooks. More importantly, this module makes no assumption regarding which other third party libraries (ORMs, middleware, templating engines, etc) you'd like to use in your app.



## Docs
1. [Getting Started](/docs/01-getting-started.md)
2. [Controllers](/docs/02-controllers.md)
3. [Services](/docs/03-services.md)
4. [Middleware/Policies](/docs/04-policies.md)
5. [Routing](/docs/05-routing.md)
6. [Models and Connections](/docs/06-models-and-connections.md)
7. [Hooks and Configuration](/docs/07-hooks.md)



## Installable Hooks & Adapters
**Hooks**


To use these hooks, simply install them via `npm install --save <insert hook name here>` and require them in your `/config/hooks.js` file.


- [mycro-mongoose-rest](https://github.com/cludden/mycro-mongoose-rest)
    - Creates RESTful mongoose controllers for your mongoose models using [restify-mongoose](https://github.com/saintedlama/restify-mongoose)
- [mycro-secrets](https://github.com/cludden/mycro-secrets)
    - A secret management hook (using [vault](https://www.vaultproject.io)) for mycro apps
- [mycro-util-policies](https://github.com/kutllerskaggs/mycro-util-policies)
    - Installs utility polices (if, or, not, validate) for mycro apps


**Adapters**


- [mycro-mongoose](https://github.com/cludden/mycro-mongoose)
    - mongoose (MongoDB) adapter
- [mycro-vogels](https://github.com/cludden/mycro-vogels)
    - vogels (DynamoDB) adapter.



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
