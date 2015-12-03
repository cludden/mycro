'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

// whitelist restify methods
var supportedMethods = ['del', 'get', 'head', 'post', 'put'],
    configAttributes = ['middleware', 'version', 'name'];

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[routes] hook starting');

    var routes = {};
    try {
        routes = require(process.cwd() + '/app/routes')(self);
    } catch (err) {
        self.log('info', '[routes] no routes found');
    }

    var defaultMiddleware = routes.middleware,
        version = routes.version || self._config.server.version,
        name = routes.name;

    routes = _.omit(routes, configAttributes);

    _.each(routes, function(config, route) {
        var middleware = config.middleware || defaultMiddleware || [];
        _.each(_.omit(config, configAttributes), function(handlers, method) {
            // do nothing if method is not supported by restify
            if (supportedMethods.indexOf(method) === -1) return;

            // if a single handler was provided, wrap it in an array
            if (!_.isArray(handlers)) {
                handlers = [handlers];
            }

            // apply default middleware
            if (handlers.length === 1 && middleware.length) {
                handlers = middleware.slice().concat(handlers);
            }

            // process handlers
            var length = handlers.length;
            handlers = _(handlers).map(function(handler, i) {
                return processHandler.call(self, handler, (i === (length - 1)));
            }).compact().value();

            // define base route object
            var path = _.omit({
                path: route,
                version: config.version || version,
                name: (config.name || route) + ' (' + method.toUpperCase() + ')'
            }, _.isEmpty);

            // create the route
            var args = [path].concat(handlers);
            self.log('silly', '[routes] binding route:  ' + route + ' (' + method.toUpperCase() + ')');
            self.server[method].apply(self.server, args);
        });
    });

    self.log('info', '[routes] hook complete');
    cb();
};


/**
 * Process an individual middleware or endpoint
 *
 * @param  {string|object|function} handler - the handler
 * @param  {[boolean]} final - is this the final handler
 * @return {function|undefined}
 */
function processHandler(handler, final) {
    if (_.isFunction(handler)) return handler;

    var container;
    if (_.isString(handler)) {
        container = final ? 'controllers' : 'policies';
        return processStringHandler.call(this, handler, container);
    }

    if (_.isObject(handler)) {
        var containers = ['controllers', 'policies'],
            config = _.clone(handler);

        // find first container on handler config
        container = _.find(containers, function(c) {
            return handler.hasOwnProperty(c);
        });

        //TODO extend request options with additional configuration

        handler = handler[container];
        return processStringHandler.call(this, handler, container);
    }
};


/**
 * [processStringHandler description]
 *
 * @param  {string} handler   - the handler name
 * @param  {string} container - the container to search in
 * @return {function|undefined}
 */
function processStringHandler(handler, container) {
    var path = handler.split('.'),
        name = path.shift();

    // lookup the handler in the appropriate container
    handler = this[container][name];

    // if the located handler is an object, lookup the action
    if (handler && _.isObject(handler) && !_.isFunction(handler)) {
        handler = _.get(handler, path);
    }

    if (!handler) {
        throw new Error('Unable to find handler: ' + name + ' in ' + container);
    }
    return handler;
}
