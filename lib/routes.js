'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

var supportedMethods = ['del', 'get', 'head', 'post', 'put'];


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
        return processStringHandler(handler, container);
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
        return processStringHandler(handler, container);
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
    if (action && _.isObject(handler)) {
        handler = _.get(handler, path);
    }

    return handler;
}

module.exports = function(cb) {
    var self = this;

    var routes = self._config.routes || {},
        defaultMiddleware = routes.middleware;

    routes = _.omit(routes, 'middleware');

    _.each(routes, function(config, route) {
        var middleware = config.middleware || defaultMiddleware;

        _(config).omit('middleware').each(function(handler, method) {
            // do nothing if method is not supported by restify
            if (supportedMethods.indexOf(method) === -1) return;

            // check for middleware overrides
            if (!_.isArray(handler) && middleware.length) {
                handler = middleware.slice().push(handler);
            }

            // build restify arguments
            var args = [route];
            if (_.isArray(handler)) {
                args = args.concat(handler);
            } else {
                args.push(handler);
            }

            self.server[method].apply(null, args);
        });
    });

    cb();
};
