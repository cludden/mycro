## Middleware
Common middleware can be specified in the `/config/server.js` file. This allows you to customize the `restify` server in any manner you'd like. Custom middleware must be defined as a function that returns the appropriate middleware function. The function will be passed the `microservice` instance as the only argument. This gives you access to the underlying `restify` instance, which is available on the `microservice` instance at `microservice._restify`. `restify` comes bundled with several common middleware for parsing request body and query parameters, as well as many others. For convenience, several common middleware come bundled with this module and can be used via their filenames. Check out the [restify](http://restify.com/) docs for more info on available middleware. An example of a sample server configuration is shown below.


*/config/server.js*
```javascript
module.exports = {
    // specify a default server version
    version: '1.0.0',

    // define middleware
    middleware: [
        // bundled middleware
        'acceptParser',
        'dateParser',
        'queryParser',
        'bodyParser',

        // define some custom middleware
        function cors(microservice) {
            return microservice._restify.CORS({
                origins: ['*'], // defaults to ['*']
                credentials: true, // defaults to false
                headers: ['x-foo'] // sets expose-headers
            });
        },
        function morgan() {
            return require('morgan')('dev');
        },

        // more bundled middleware
        'request'
    ]
};
```

## Bundled Middleware
**acceptParser**


Implements `restify`'s own *Accept Parser* middleware with the default **acceptable** arguments. If you need different behavior, you can implement your own **acceptParser** middleware:


*/config/server.js*
```javascript
module.exports = {
    middleware: [
        // ..
        function acceptParser(microservice) {
            return microservice._restify.acceptParser(/* custom arguments here */);
        }
        // ..
    ]
};
```

---
**dateParser**


Implements `restify`'s own *Date Parser* middleware with the default settings. To override:


*/config/server.js*
```javascript
module.exports = {
    middleware: [
        // ..
        function dateParser(microservice) {
            return microservice._restify.dateParser(60);
        }
        // ..
    ]
};
```

---
**queryParser**


Implements `restify`'s own *Query Parser* middleware with the default settings. To override:


*/config/server.js*
```javascript
module.exports = {
    middleware: [
        // ..
        function dateParser(microservice) {
            return microservice._restify.queryParser({
                mapParams: false
            });
        }
        // ..
    ]
};
```

---
**bodyParser**


Implements `restify`'s own *Body Parser* middleware with the default settings. To override:


*/config/server.js*
```javascript
module.exports = {
    middleware: [
        // ..
        function bodyParser(microservice) {
            return microservice._restify.bodyParser({
                maxBodySize: 0,
                mapParams: true,
                mapFiles: false,
                overrideParams: false,
                multipartHandler: function(part) {
                    part.on('data', function(data) {
                      /* do something with the multipart data */
                    });
                },
                multipartFileHandler: function(part) {
                    part.on('data', function(data) {
                      /* do something with the multipart file data */
                    });
                },
                keepExtensions: false,
                uploadDir: os.tmpdir(),
                multiples: true
                hash: 'sha1'
            });
        }
        // ..
    ]
};
```

---
**request**


Attaches the `microservice` instance to each request @ `req.microservice` and defines the initial request options as an empty object (ie `req.options = {}`).


[Back to home](/README.md)
