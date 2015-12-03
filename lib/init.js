'use strict';

var include = require('include-all'),
    async = require('async'),
    _ = require('lodash');

module.exports = function() {
    var self = this;

    // gather default config
    var defaults = include({
        dirname: __dirname + '/../config',
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
    }

    self._hooks = [];
    self._config.hooks.forEach(function(hook) {
        if (hook.fn) {
            self._hooks.push(hook.fn);
            self.log('silly', '[init] loading hook: ' + hook.name);
            return;
        } else {
            var resolved;
            try {
                resolved = require('./' + hook.name);
                self._hooks.push(resolved);
                self.log('silly', '[init] loading hook: ' + hook.name);
                return;
            } catch (err) {
                self.log('error', '[init] unable to locate hook: ' + hook.name);
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
    }
};
