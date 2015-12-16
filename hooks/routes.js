'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

// whitelist restify methods
var supportedMethods = ['del', 'get', 'head', 'post', 'put'],
    configAttributes = ['middleware', 'version', 'name', 'regex'];

module.exports = function Routes(cb) {
    var self = this;

    var routes = {};
    try {
        routes = require(process.cwd() + '/app/routes');
        if (_.isFunction(routes)) routes = routes(self);
    } catch (err) {
        self.log('info', '[Routes] no routes found');
    }

    var defaultMiddleware = routes.middleware || [],
        defaultVersion = routes.version || self._config.server.version,
        name = routes.name;

    routes = _.omit(routes, configAttributes);

    function bindRoutes(config, route, defaultMiddleware) {
        // if the key is a semver version tag, bind routes using the nested route object
        if (/^\d+\.\d+\.\d+$/g.test(route)) {
            return _.each(config, function(_config, _route) {
                _config.version = route;
                bindRoutes(_config, _route, config.middleware || defaultMiddleware);
            });
        }

        // handle regex routes
        if (config.regex === true) {
            route = new RegExp(route);
        }

        var middleware = config.middleware || defaultMiddleware || [];
        _.each(_.omit(config, configAttributes), function(handlers, method) {
            // do nothing if method is not supported by restify
            if (supportedMethods.indexOf(method) === -1) return;

            // if a single handler was provided, wrap it in an array
            var applyDefaultMiddleware = !_.isArray(handlers);
            if (applyDefaultMiddleware) {
                handlers = [handlers];
            }

            // apply default middleware
            if (applyDefaultMiddleware) {
                handlers = middleware.slice().concat(handlers);
            }

            // process handlers
            var length = handlers.length;
            handlers = _(handlers).map(function(handler, i) {
                return processHandler(self, handler, (i === (length - 1)));
            }).compact().value();

            var version = config.version || defaultVersion;

            // define base route object
            var path = _.omit({
                path: route,
                version: version,
                name: config.name
            }, function(value) {
                return _.isEmpty(value) && !_.isRegExp(value);
            });

            // create the route
            var args = [path].concat(handlers);
            self.log('silly', '[routes] binding route:  ' + route + ' (' + method.toUpperCase() + ', ' + version + ')');
            self.server[method].apply(self.server, args);
        });
    }

    _.each(routes, function(config, route) {
        bindRoutes(config, route, defaultMiddleware);
    });

    cb();
};


/**
 * Process an individual middleware or endpoint
 *
 * @param  {string|object|function} handler - the handler
 * @param  {[boolean]} final - is this the final handler
 * @return {function|undefined}
 */
function processHandler(microservice, handler, final) {
    if (_.isFunction(handler)) return handler;

    var container;
    if (_.isString(handler)) {
        container = final ? 'controllers' : 'policies';
        return processStringHandler(microservice, handler, container);
    }

    if (_.isObject(handler)) {
        var containers = ['controller', 'policy'],
            config = _.clone(handler);

        // find first container on handler config
        container = _.find(containers, function(c) {
            return handler.hasOwnProperty(c);
        });
        handler = handler[container];
        container = container === 'controller' ? 'controllers' : 'policies';

        //TODO extend request options with additional configuration

        return processStringHandler(microservice, handler, container);
    }
}


/**
 * [processStringHandler description]
 *
 * @param  {string} handler   - the handler name
 * @param  {string} container - the container to search in
 * @return {function|undefined}
 */
function processStringHandler(microservice, handler, container) {
    var path = handler.split('.'),
        name = path.shift();

    // lookup the handler in the appropriate container
    handler = microservice[container][name];

    // if the located handler is an object, lookup the action
    if (handler && _.isObject(handler) && !_.isFunction(handler)) {
        handler = _.get(handler, path);
    }

    if (!handler) {
        throw new Error('Unable to find handler: ' + name + ' in ' + container);
    }
    return handler;
}
