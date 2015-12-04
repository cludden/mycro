'use strict';

var EventEmitter = require('events'),
    include = require('include-all'),
    _ = require('lodash'),
    async = require('async');

var Microservice = function(config) {
    var self = this;

    // inherit from EventEmitter
    EventEmitter.call(self);

    // set defauts
    self._config = config || {};
    self._version = require('./package.json').version;

    // gather default config
    var defaults = include({
        dirname: __dirname + '/config',
        filter:  /(.+)\.js$/,
        optional:  true
    });

    // gather user config
    var userConfig = include({
        dirname: process.cwd() + '/config',
        filter:  /(.+)\.js$/,
        optional: true
    });

    // initialize constructors
    userConfig = _.mapValues(userConfig, function(constructor) {
        if (typeof constructor === 'function') {
            if (constructor.length === 1) return constructor(self);
            return constructor();
        }
        return constructor;
    });

    // create microservice config and store it on the service object
    self._config = _.defaults(_.extend(userConfig, self._config), defaults);

    // configure logger settings
    self.logger = new self._config.logger(self._config.log || {level: process.env['NODE_ENV'] === 'production' ? 'none' : 'silly'});
    self.log = function() {
        return self.logger.log.apply(self.logger, Array.prototype.slice.call(arguments));
    };

    self._hooks = [];
    self._config.hooks.forEach(function(hook) {
        if (_.isFunction(hook)) {
            self._hooks.push(hook);
            self.log('silly', '[init] loading hook: ', hook);
            return;
        }

        if (_.isString(hook)) {
            var resolved;
            try {
                resolved = require('./hooks/' + hook);
                self._hooks.push(resolved);
                self.log('silly', '[init] loading hook: ' + hook);
                return;
            } catch (err) {
                self.log('error', '[init] unable to locate hook: ' + hook);
                self.log('error', err);
            }
        }
    });

    self.start = function(done) {
        async.eachSeries(
            self._hooks,
            function(hook, fn) {
                return hook.call(self, fn);
            },
            function(err) {
                // handle unexpected error
                if (err) return done(err);

                // start the server
                var port = parseInt(self._config.server.port || process.env['PORT']);
                if (typeof port !== 'number') return done('Invalid port: ' + port);
                self.server.listen(port);

                done();
            }
        );
    };
};

module.exports = Microservice;
