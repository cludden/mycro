## Configuration
Hooks can be configured using config files located in the `/config` folder. Some common configuration options are outlined below.

## Logging
`restify-microservice` comes bundled with a [winston](https://github.com/winstonjs/winston) logger. You can override this by defining your own logger in `/config/logger.js`, which must export a function that returns a constructor for your custom logger. The default logger configuration is shown below.
```javascript
var winston = require('winston');

module.exports = function() {
    return winston.Logger;
};
```


In addition to overriding the default logger, you can configure the default logger by defining your own winston configuration in `/config/log.js`. The default configuration is shown below.
```javascript
var winston = require('winston');

module.exports = {
    level: 'silly',
    transports: [
        new (winston.transports.Console)({
            colorize: true
        })
    ],
    colors: {
        error: 'red',
        warn: 'orange',
        info: 'magenta',
        verbose: 'green',
        debug: 'blue',
        silly: 'cyan'
    }
};
```
[Back to home](/README.md)
