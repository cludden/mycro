'use strict';

var restify = require('restify'),
    _ = require('lodash'),
    include = require('include-all');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[server] hook starting');
    self.name = 'server';

    // store a reference to this restify
    self._restify = restify;

    // locate user defined server config and create server
    var config = self._config.server.config;
    self.server = restify.createServer(config);

    // load common middleware
    var standardMiddlewares = include({
        dirname     :  __dirname + '/middleware',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    standardMiddlewares = _.mapValues(standardMiddlewares, function(middleware) {
        return middleware(self);
    });

    // filter and sort middleware
    var middlewareConfig = self._config.server.middleware || [];
    middlewareConfig.forEach(function(middleware) {
        if (_.isFunction(middleware)) {
            self.log('silly', '[server] loading middleware: ' + middleware.name);
            return self.server.use(middleware(self));
        }
        if (_.isString(middleware)) {
            var fn = standardMiddlewares[middleware];
            if (_.isFunction(fn)) {
                self.log('silly', '[server] loading middleware: ' + middleware);
                return self.server.use(fn);
            }
        }
    });

    // load custom middleware
    var custom = self._config.server.customMiddleware || [];
    if (custom.length) {
        custom.forEach(function(middleware) {
            self.server.use(middleware(self));
        });
        self.log('silly', '[server] custom middleware loaded');
    }

    self.log('info', '[server] hook complete');
    cb();
};
