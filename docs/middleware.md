## Middleware
Common middleware can be specified in the `/config/server.js` file. This allows you to customize the `restify` server in any manner you'd like. Custom middleware must be defined as a function that returns the appropriate middleware. The function will be passed the `microservice` instance as the sole argument. This gives you access to the underlying `restify` instance, which is available on the `microservice` instance at `microservice._restify`. `restify` comes bundled with several common middleware for parsing request body and query parameters, as well as many others. Check out the [restify](http://restify.com/) docs for more info. An example of a sample server configuration is shown below.

```javascript
module.exports = {
    // specify a default server version
    version: '1.0.0',

    // define middleware
    middleware: [
        function acceptParser(microservice) {
            return microservice._restify.acceptParser(microservice.server.acceptable);
        },
        function dateParser(microservice) {
            return microservice._restify.dateParser();
        },
        function queryParser(microservice) {
            return microservice._restify.queryParser();
        },
        function bodyParser(microservice) {
            return microservice._restify.bodyParser();
        },
        function morgan() {
            return require('morgan')('dev');
        },
        'request'
    ]
};
```
[Back to home](/README.md)
