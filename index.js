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

    // initialize any config files that export constructors
    // note: if constructors expect a single argument, the microservice will be
    // passed as the sole argument
    defaults = _.mapValues(defaults, function(constructor) {
        if (typeof constructor === 'function') {
            return constructor(self);
        }
        return constructor;
    });
    userConfig = _.mapValues(userConfig, function(constructor) {
        if (typeof constructor === 'function') {
            return constructor();
        }
        return constructor;
    });


    // create microservice config and store it on the service object
    self._config = _.defaults(_.extend(userConfig, self._config), defaults);

    // configure logger settings
    self.logger = new self._config.logger(self._config.log);
    self.log = function() {
        self.logger.log.apply(self.logger, Array.prototype.slice.call(arguments));
    };

    self._hooks = [];
    self._config.hooks.forEach(function(hook) {
        if (_.isFunction(hook)) {
            self._hooks.push(hook);
            self.log('silly', '[init] loading hook: ' + hook.name);
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
                try {
                    resolved = require(hook);
                    self._hooks.push(resolved);
                    self.log('silly', '[init] loading hook: ' + hook);
                    return;
                } catch (e) {
                    self._hooks.push(function(cb) {
                        self.log('error', 'error loading hook: ' + hook);
                        cb(e);
                    });
                    return;
                }
            }
        }
    });

    self.start = function(done) {
        console.log('CONFIG', self._config.server);
        console.log(process.cwd());
        async.eachSeries(
            self._hooks,
            function(hook, fn) {
                return hook.call(self, function(err) {
                    if (err) {
                        self.log('error', '[' + hook.name + ']', err);
                        return fn(err);
                    }
                    self.log('info', '[' + hook.name + '] hook loaded successfully');
                    fn();
                });
            },
            function(err) {
                // handle unexpected error
                if (err) return done(err);
                if (!self.server || !self.server.listen || typeof self.server.listen !== 'function') return done();

                // start the server
                var port = parseInt(self._config.server.port || process.env['PORT']);
                if (isNaN(port)) return done();
                self.server.listen(port);
                done();
            }
        );
    };
};

module.exports = Microservice;
