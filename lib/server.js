'use strict';

var restify = require('restify'),
    _ = require('lodash'),
    include = require('include-all');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[server] hook starting');

    // store a reference to this restify
    self._restify = restify;

    // locate user defined server config and create server
    var config = self._config.server.config;
    self.server = restify.createServer(config);

    // load common middleware
    var middlewares = include({
        dirname     :  __dirname + '/middleware',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true,
        resolve: function(constructor) {
            return constructor(self);
        }
    });

    // filter and sort middleware
    var middlewareConfig = self._config.server.middleware;
    _(middlewares).pick(function(fn, name) {
        return middlewareConfig.indexOf(name) !== -1;
    }).pairs().sortBy(function(pair) {
        return middlewareConfig.indexOf(pair[0]);
    }).map(function(pair) {
        self.log('silly', '[server] loading middleware: ' + pair[0]);
        self.server.use(pair[1]);
    });

    self.log('info', '[server] hook complete');
    cb();
};
