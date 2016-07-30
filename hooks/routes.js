'use strict';

const async = require('async');
const include = require('include-all');
const lib = require('./routes/index');
const _ = require('lodash');

/**
 * Separate hook from export for stubbing in tests.
 * @param  {Function} cb
 * @this mycro
 */
module.exports = function routes(done) {
    return module.exports.hook.call(this, done);
};

module.exports.hook = function(done) {
    const mycro = this;
    const defaultVersion = mycro._config.server.version || '1.0.0';
    let definition;

    try {
        definition = require(process.cwd() + '/app/routes');
        if (_.isFunction(definition)) {
            definition = definition(mycro);
        }
    } catch (err) {
        mycro.log('info', '[Routes] no routes found');
        return async.setImmediate(function() {
            done(err);
        });
    }

    const routes = include({
        dirname:  process.cwd() + '/app/routes',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    _.mapValues(routes, function(route) {
        if (_.isFunction(route)) {
            return route(mycro);
        }
        return route;
    });

    lib.handleDefinition(mycro, {
        currentPath: '',
        definition: definition,
        regexPathDefinition: '',
        routes: routes,
        version: defaultVersion
    }, done);
};
